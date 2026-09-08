import { AnalysisResponse, SpeakResponse, TranscribeResponse } from '../types/feedback';
import { PracticeSession } from '../types/practiceSession';

/**
 * Core API Service communicating with the backend API endpoints.
 */
export class ApiService {
  private static baseUrl = '';
  private static STORAGE_KEY_API_KEY = 'ai_voice_tutor_gemini_key';

  /**
   * Get stored Gemini API key from localStorage (if user configured one in browser)
   */
  public static getStoredApiKey(): string {
    try {
      return localStorage.getItem(this.STORAGE_KEY_API_KEY) || '';
    } catch {
      return '';
    }
  }

  /**
   * Save Gemini API key to localStorage
   */
  public static setStoredApiKey(key: string): void {
    try {
      if (key && key.trim()) {
        localStorage.setItem(this.STORAGE_KEY_API_KEY, key.trim());
      } else {
        localStorage.removeItem(this.STORAGE_KEY_API_KEY);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Remove stored Gemini API key
   */
  public static removeStoredApiKey(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY_API_KEY);
    } catch {
      // ignore
    }
  }

  /**
   * Helper to construct headers with the API key attached
   */
  private static getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
    const key = this.getStoredApiKey();
    if (key) {
      headers['x-gemini-api-key'] = key;
    }
    return headers;
  }

  /**
   * Checks whether Gemini API key is configured on server or client
   */
  public static async checkApiKeyStatus(): Promise<{
    configured: boolean;
    keyPrefix: string | null;
    source: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/config/api-key`, {
        headers: this.getHeaders(),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // ignore
    }
    const localKey = this.getStoredApiKey();
    return {
      configured: Boolean(localKey),
      keyPrefix: localKey ? `${localKey.substring(0, 6)}...` : null,
      source: localKey ? 'client-storage' : 'none',
    };
  }

  /**
   * Save Gemini API key to server session / local .env file
   */
  public static async saveApiKeyToServer(apiKey: string): Promise<{ success: boolean; message: string; keyPrefix?: string }> {
    const cleanKey = apiKey.trim();
    this.setStoredApiKey(cleanKey);

    const response = await fetch(`${this.baseUrl}/api/config/api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: cleanKey }),
    });

    if (!response.ok) {
      let errMsg = 'Failed to verify API key';
      try {
        const data = await response.json();
        if (data && data.error) errMsg = data.error;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    return await response.json();
  }

  /**
   * Helper to convert a Blob into a base64 string
   */
  public static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // remove the data:*/*;base64, prefix
        const base64Clean = base64data.split(',')[1] || base64data;
        resolve(base64Clean);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * POST /api/transcribe
   * Sends audio to backend for Speech-to-Text conversion.
   */
  public static async transcribe(
    audioBlob: Blob,
    language: string,
    clientTranscript?: string
  ): Promise<TranscribeResponse> {
    const audioBase64 = await this.blobToBase64(audioBlob);
    const mimeType = audioBlob.type || 'audio/webm';

    const response = await fetch(`${this.baseUrl}/api/transcribe`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        audioBase64,
        mimeType,
        language,
        clientTranscript,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Transcription error (${response.status})`;
      try {
        const err = await response.json();
        if (err && err.error) errorMessage = err.error;
      } catch {
        if (response.status === 404) {
          errorMessage = 'API route /api/transcribe not found (404). Please verify backend deployment.';
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * POST /api/analyze
   * Sends transcribed sentence and target language for LLM grammar & vocabulary analysis.
   */
  public static async analyze(sentence: string, targetLanguage: string, difficultyLevel?: string): Promise<AnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        sentence,
        targetLanguage,
        difficultyLevel: difficultyLevel || 'intermediate',
      }),
    });

    if (!response.ok) {
      let errorMessage = `Analysis error (${response.status})`;
      try {
        const err = await response.json();
        if (err && err.error) errorMessage = err.error;
      } catch {
        if (response.status === 404) {
          errorMessage = 'API route /api/analyze not found (404). Please verify backend deployment.';
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * POST /api/speak
   * Request Text-to-Speech audio for the corrected sentence.
   */
  public static async speak(text: string, language: string): Promise<SpeakResponse> {
    const response = await fetch(`${this.baseUrl}/api/speak`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        text,
        language,
      }),
    });

    if (!response.ok) {
      let errorMessage = `TTS error (${response.status})`;
      try {
        const err = await response.json();
        if (err && err.error) errorMessage = err.error;
      } catch {
        // Fallback gracefully
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * GET /api/progress
   * Retrieves stored sessions from backend.
   */
  public static async getProgress(): Promise<PracticeSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/progress`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback handled in practice session hook
    }
    return [];
  }

  /**
   * POST /api/progress
   * Saves a session to the backend.
   */
  public static async saveSession(session: PracticeSession): Promise<PracticeSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback handled in practice session hook
    }
    return [];
  }
}
