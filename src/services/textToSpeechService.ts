import { ApiService } from './apiService';

export type TTSStatus = 'idle' | 'loading' | 'playing' | 'paused';

export interface TTSPlayerCallbacks {
  onStatusChange?: (status: TTSStatus) => void;
  onError?: (error: string) => void;
}

export class TextToSpeechService {
  private static currentAudio: HTMLAudioElement | null = null;
  private static status: TTSStatus = 'idle';
  private static callbacks: TTSPlayerCallbacks = {};
  private static playbackRate: number = 1.0;

  /**
   * Register state listener callbacks
   */
  public static setCallbacks(callbacks: TTSPlayerCallbacks) {
    this.callbacks = callbacks;
  }

  private static updateStatus(status: TTSStatus) {
    this.status = status;
    this.callbacks.onStatusChange?.(status);
  }

  public static getStatus(): TTSStatus {
    return this.status;
  }

  public static setPlaybackRate(rate: number) {
    this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.playbackRate;
    }
  }

  /**
   * Speak the sentence using native Web Speech Synthesis with matching target language locale,
   * with fallback to server-synthesized audio if needed.
   */
  public static async speak(
    text: string,
    locale: string = 'en-US',
    useBackendTts: boolean = false
  ): Promise<void> {
    this.stop();

    if (!text || !text.trim()) {
      return;
    }

    // Option 1: Backend TTS (Gemini Speech API)
    if (useBackendTts) {
      try {
        this.updateStatus('loading');
        const res = await ApiService.speak(text, locale);
        if (res.audioBase64) {
          const audioSrc = `data:${res.mimeType || 'audio/wav'};base64,${res.audioBase64}`;
          const audio = new Audio(audioSrc);
          audio.playbackRate = this.playbackRate;
          this.currentAudio = audio;

          audio.onplay = () => this.updateStatus('playing');
          audio.onpause = () => {
            if (audio.currentTime < audio.duration) {
              this.updateStatus('paused');
            }
          };
          audio.onended = () => {
            this.updateStatus('idle');
            this.currentAudio = null;
          };
          audio.onerror = () => {
            this.updateStatus('idle');
            this.callbacks.onError?.('Audio playback failed');
            this.currentAudio = null;
          };

          await audio.play();
          return;
        }
      } catch (err: unknown) {
        console.warn('Backend TTS failed, falling back to Web Speech API', err);
      }
    }

    // Option 2: High-fidelity Web Speech API (Client native pronunciation)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.updateStatus('playing');
        window.speechSynthesis.cancel(); // Clear any pending queue

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = locale;
        utterance.rate = this.playbackRate;
        utterance.pitch = 1.0;

        // Try to pick a high quality native voice for the selected locale
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(
          (v) => v.lang === locale || v.lang.startsWith(locale.split('-')[0])
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onend = () => {
          this.updateStatus('idle');
        };

        utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e);
          this.updateStatus('idle');
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            this.callbacks.onError?.(`TTS playback error: ${e.error}`);
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (err: unknown) {
        this.updateStatus('idle');
        const msg = err instanceof Error ? err.message : String(err);
        this.callbacks.onError?.(`Failed to generate speech: ${msg}`);
      }
    } else {
      this.updateStatus('idle');
      this.callbacks.onError?.('Text-to-Speech is not supported in this browser.');
    }
  }

  /**
   * Stop current speech playback
   */
  public static stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.updateStatus('idle');
  }

  /**
   * Pause current speech playback
   */
  public static pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.updateStatus('paused');
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.updateStatus('paused');
    }
  }

  /**
   * Resume paused playback
   */
  public static resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      this.updateStatus('playing');
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.updateStatus('playing');
    }
  }
}
