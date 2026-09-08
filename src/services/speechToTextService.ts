import { ApiService } from './apiService';

export interface STTOptions {
  language: string; // e.g. 'es', 'fr', 'de', etc.
  clientTranscript?: string;
  fallbackToBrowserSTT?: boolean;
}

export class SpeechToTextService {
  /**
   * Main entry point: receives recorded audio blob and target language,
   * calls backend STT (Gemini / Whisper architecture), and returns clean transcription.
   */
  public static async transcribeAudio(
    audioBlob: Blob,
    options: STTOptions
  ): Promise<string> {
    if (!audioBlob || audioBlob.size === 0) {
      if (options.clientTranscript && options.clientTranscript.trim()) {
        return options.clientTranscript.trim();
      }
      throw new Error('No audio was recorded. Please check your microphone and speak clearly.');
    }

    // Check size limit: minimum 100 bytes for audible sound
    if (audioBlob.size < 100) {
      if (options.clientTranscript && options.clientTranscript.trim()) {
        return options.clientTranscript.trim();
      }
      throw new Error('No speech detected. The recording was too brief or silent.');
    }

    try {
      const result = await ApiService.transcribe(audioBlob, options.language, options.clientTranscript);
      const text = (result.transcript || options.clientTranscript || '').trim();

      if (!text || text.toUpperCase() === 'EMPTY_SPEECH' || text.toLowerCase() === 'no speech detected') {
        if (options.clientTranscript && options.clientTranscript.trim()) {
          return options.clientTranscript.trim();
        }
        throw new Error('No clear speech was detected. Please speak closer to the microphone and try again.');
      }

      return text;
    } catch (err: unknown) {
      if (options.clientTranscript && options.clientTranscript.trim()) {
        return options.clientTranscript.trim();
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      
      // User-friendly error mapping
      if (errorMsg.includes('permission') || errorMsg.includes('NotAllowedError')) {
        throw new Error('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (errorMsg.includes('No speech detected') || errorMsg.includes('silent')) {
        throw new Error('No speech detected. Please speak clearly into your microphone.');
      } else if (errorMsg.includes('unsupported') || errorMsg.includes('format')) {
        throw new Error('Unsupported audio format. Your browser recording format could not be processed.');
      }

      throw new Error(`Speech-to-Text service error: ${errorMsg}`);
    }
  }

  /**
   * Test if the current environment supports browser-native speech recognition
   * as an alternative or auxiliary input mechanism.
   */
  public static isBrowserSpeechSupported(): boolean {
    return typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }
}
