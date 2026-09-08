import { useCallback, useEffect, useRef, useState } from 'react';
import { SpeechToTextService } from '../services/speechToTextService';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'analyzing';

export interface UseAudioRecordingOptions {
  language: string;
  onTranscriptionComplete?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useAudioRecording({
  language,
  onTranscriptionComplete,
  onError,
}: UseAudioRecordingOptions) {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const speechRecognitionRef = useRef<any>(null);
  const recognizedSpeechTextRef = useRef<string>('');

  // Clean up streams & audio context
  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null);
    isCancelledRef.current = false;
    audioChunksRef.current = [];
    recognizedSpeechTextRef.current = '';
    setDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (constraintErr) {
        console.warn('Constrained audio failed, trying basic audio stream:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;

      // Audio analysis for real-time waveform
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume().catch(() => {});
        }

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateWaveform = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateWaveform);
          }
        };
        updateWaveform();
      } catch (audioErr) {
        console.warn('Analyser setup non-fatal failure:', audioErr);
      }

      // Check supported MIME type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        cleanupAudio();

        if (isCancelledRef.current) {
          setState('idle');
          audioChunksRef.current = [];
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        const clientTranscript = recognizedSpeechTextRef.current;

        setState('processing');

        try {
          const transcript = await SpeechToTextService.transcribeAudio(audioBlob, {
            language,
            clientTranscript,
          });
          setState('idle');
          onTranscriptionComplete?.(transcript);
        } catch (err: unknown) {
          setState('idle');
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
          onError?.(msg);
        }
      };

      // Also start parallel browser SpeechRecognition for instant fallback if supported
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          
          // Map short codes to BCP-47
          const langMap: Record<string, string> = {
            en: 'en-US',
            hi: 'hi-IN',
            te: 'te-IN',
            kn: 'kn-IN',
            ml: 'ml-IN',
          };
          recognition.lang = langMap[language] || language || 'en-US';

          recognition.onresult = (event: any) => {
            let combined = '';
            for (let i = 0; i < event.results.length; i++) {
              combined += event.results[i][0].transcript + ' ';
            }
            if (combined.trim()) {
              recognizedSpeechTextRef.current = combined.trim();
            }
          };
          recognition.onerror = () => {};
          recognition.start();
          speechRecognitionRef.current = recognition;
        }
      } catch {
        // SpeechRecognition is optional
      }

      mediaRecorder.start(200); // Slice data every 200ms
      setState('recording');

      // Duration timer
      timerIntervalRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

    } catch (err: unknown) {
      cleanupAudio();
      setState('idle');
      let msg = 'Failed to access microphone.';
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        msg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      onError?.(msg);
    }
  }, [cleanupAudio, language, onError, onTranscriptionComplete]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        // Flush remaining buffer
        mediaRecorderRef.current.requestData();
      } catch {
        // ignore
      }
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Cancel recording and reset
  const cancelRecording = useCallback(() => {
    isCancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    cleanupAudio();
    setState('idle');
    setDuration(0);
    setError(null);
  }, [cleanupAudio]);

  // Restart recording
  const restartRecording = useCallback(() => {
    cancelRecording();
    setTimeout(() => {
      startRecording();
    }, 200);
  }, [cancelRecording, startRecording]);

  return {
    state,
    setState,
    error,
    setError,
    audioLevel,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    restartRecording,
  };
}
