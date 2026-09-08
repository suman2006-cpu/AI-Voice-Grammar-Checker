import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for parsing json and urlencoded data with ample capacity for base64 audio
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/**
 * Sanitizes error messages to prevent any sensitive credentials from ever being returned.
 */
function sanitizeErrorMessage(msg: string): string {
  if (!msg || typeof msg !== 'string') return 'An error occurred';
  return msg
    .replace(/key=[A-Za-z0-9_-]+/gi, 'key=***')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer ***');
}

// Lazy Gemini AI initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  const rawKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server. If using Vercel, please add GEMINI_API_KEY under Project Settings > Environment Variables, and click Redeploy.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// In-memory practice session store
interface PracticeSessionRecord {
  id: string;
  date: string;
  targetLanguage: string;
  originalSentence: string;
  correctedSentence: string;
  grammarMistakes: number;
  grammarFeedback?: Array<{ original: string; corrected: string; explanation: string }>;
  vocabularyFeedback?: Array<{ word: string; suggestion: string; explanation: string }>;
  overallFeedback?: string;
  difficultyLevel: string;
}

const practiceSessionsStore: PracticeSessionRecord[] = [];

// ====================================================
// API ROUTES
// ====================================================

// Health check (supports both /api/health and /health)
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  const rawKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');
  res.json({
    status: 'ok',
    service: 'AI Voice Language Tutor API',
    geminiConfigured: Boolean(apiKey),
    keyPrefix: apiKey ? `${apiKey.substring(0, 6)}...` : null,
  });
});

/**
 * Helper to extract transcript text from any Gemini response (handles both
 * gemini-3.5-transcribe audioTranscription parts and standard text parts)
 */
function extractTranscriptFromGeminiResponse(response: any): string {
  if (!response) return '';
  let extracted = '';

  const candidates = response.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (part.audioTranscription) {
        if (typeof part.audioTranscription === 'string') {
          extracted += part.audioTranscription + ' ';
        } else if (part.audioTranscription.text) {
          extracted += part.audioTranscription.text + ' ';
        } else if (part.audioTranscription.transcript) {
          extracted += part.audioTranscription.transcript + ' ';
        }
      }
      if (part.text) {
        extracted += part.text + ' ';
      }
    }
  }

  // Fallback to response.text if candidate extraction was empty
  if (!extracted.trim()) {
    try {
      if (typeof response.text === 'string') {
        extracted = response.text;
      }
    } catch {
      // Ignore getter warnings from SDK
    }
  }

  return extracted.replace(/^["'`]+|["'`]+$/g, '').trim();
}

/**
 * POST /api/transcribe
 * Transcribe spoken audio using Speech-to-Text (Gemini 3.5 Transcribe & Gemini 3.8 Flash)
 */
app.post(['/api/transcribe', '/transcribe'], async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType, language, clientTranscript } = req.body;

    if (!audioBase64) {
      if (clientTranscript && clientTranscript.trim()) {
        return res.json({
          transcript: clientTranscript.trim(),
          language: language || 'auto',
        });
      }
      return res.status(400).json({ error: 'No audio data provided' });
    }

    const ai = getAIClient();

    // Clean MIME type (e.g., 'audio/webm;codecs=opus' -> 'audio/webm')
    const cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim();

    const audioPart = {
      inlineData: {
        mimeType: cleanMimeType,
        data: audioBase64,
      },
    };

    const targetLangPrompt = language
      ? `The speaker is speaking or practicing ${language}.`
      : '';

    const promptText = `Transcribe the spoken words in this audio exactly as uttered. ${targetLangPrompt}
Provide ONLY the transcribed text in your response, with no quotes, formatting, or commentary.
If no speech or only background noise/silence is detected, respond with EMPTY_SPEECH.`;

    let transcript = '';

    // 1. Primary: Dedicated audio transcription model (gemini-3.5-transcribe)
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [audioPart],
        },
      });
      transcript = extractTranscriptFromGeminiResponse(response);
      console.log('gemini-3.5-transcribe result:', transcript ? `"${transcript}"` : '(empty)');
    } catch (transcribeError) {
      console.warn('gemini-3.5-transcribe error, falling back to gemini-3.7-flash:', transcribeError);
    }

    // 2. Multimodal Fallbacks: reliable high-availability models first
    if (!transcript || transcript.toUpperCase() === 'EMPTY_SPEECH') {
      const audioFallbackModels = [
        'gemini-3.1-flash-lite-preview',
        'gemini-3.1-flash-lite',
        'gemini-3-flash-preview',
        'gemini-3.7-flash',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
      ];
      for (const fbModel of audioFallbackModels) {
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: fbModel,
            contents: {
              parts: [audioPart, { text: promptText }],
            },
          });
          const fbText = extractTranscriptFromGeminiResponse(fallbackResponse);
          if (fbText && fbText.toUpperCase() !== 'EMPTY_SPEECH') {
            transcript = fbText;
            console.log(`${fbModel} audio transcription result:`, transcript);
            break;
          }
        } catch (fbErr: any) {
          console.warn(`${fbModel} audio fallback warning (${fbErr?.status || fbErr?.message || fbErr}): trying next fallback`);
        }
      }
    }

    // 3. Fallback: If AI returned empty/EMPTY_SPEECH but browser speech recognition heard text
    if ((!transcript || transcript.toUpperCase() === 'EMPTY_SPEECH') && clientTranscript && clientTranscript.trim()) {
      transcript = clientTranscript.trim();
    }

    if (!transcript || transcript.toUpperCase() === 'EMPTY_SPEECH') {
      return res.status(422).json({
        error: 'No speech detected. Please speak clearly into your microphone.',
      });
    }

    res.json({
      transcript,
      language: language || 'auto',
    });
  } catch (error: unknown) {
    console.error('Error in /api/transcribe:', error);
    const msg = error instanceof Error ? error.message : 'Transcription failed';
    res.status(500).json({ error: sanitizeErrorMessage(msg) });
  }
});

/**
 * POST /api/analyze
 * LLM Grammar and Vocabulary Analysis using Gemini
 */
app.post(['/api/analyze', '/analyze'], async (req: Request, res: Response) => {
  try {
    const { sentence, targetLanguage, difficultyLevel } = req.body;

    if (!sentence || typeof sentence !== 'string' || !sentence.trim()) {
      return res.status(400).json({ error: 'Sentence parameter is required' });
    }

    const lang = targetLanguage || 'English';
    const level = difficultyLevel || 'intermediate';
    const ai = getAIClient();

    const systemInstruction = `You are a friendly, encouraging, and expert language tutor.
A learner will provide a spoken sentence that has been converted to text.
Your job is to analyze the sentence in the learner's target language (${lang}).

Supported languages include English, Hindi, Telugu, Kannada, and Malayalam.
If the sentence is in Hindi, Telugu, Kannada, or Malayalam, the student may speak in native script or in romanized transliteration; accept either and provide the accurate corrected sentence in native script with clear, warm guidance.

You must:
- Check grammar and subject-verb agreement.
- Check vocabulary and word choice.
- Identify unnatural phrasing when appropriate.
- Generate a natural, corrected version.
- Explain mistakes using simple and easily understandable language.
- Preserve the learner's intended meaning.
- If the sentence is already correct, congratulate the learner and optionally offer a natural alternative.
- Return the result as valid structured JSON only.`;

    const userPrompt = `Target Language: ${lang}
Target Learner Level: ${level}
Learner Sentence: "${sentence.trim()}"

Analyze this sentence and return the JSON response schema.`;

    const analysisConfig = {
      systemInstruction,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalSentence: {
            type: Type.STRING,
            description: 'The exact original sentence from the learner',
          },
          correctedSentence: {
            type: Type.STRING,
            description: 'The grammatically and idiomatically corrected sentence',
          },
          grammarFeedback: {
            type: Type.ARRAY,
            description: 'List of grammar mistakes found. Empty array if none.',
            items: {
              type: Type.OBJECT,
              properties: {
                original: {
                  type: Type.STRING,
                  description: 'The erroneous word or phrase',
                },
                corrected: {
                  type: Type.STRING,
                  description: 'The corrected word or phrase',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Simple and concise explanation of why the correction is needed',
                },
              },
              required: ['original', 'corrected', 'explanation'],
            },
          },
          vocabularyFeedback: {
            type: Type.ARRAY,
            description: 'Optional list of vocabulary suggestions or unnatural word choices. Empty array if none.',
            items: {
              type: Type.OBJECT,
              properties: {
                word: {
                  type: Type.STRING,
                  description: 'The original word or phrase',
                },
                suggestion: {
                  type: Type.STRING,
                  description: 'A more natural, precise, or advanced alternative',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Explanation of nuance or usage context',
                },
              },
              required: ['word', 'suggestion', 'explanation'],
            },
          },
          overallFeedback: {
            type: Type.STRING,
            description: 'A warm, encouraging paragraph acknowledging good effort and offering advice',
          },
          difficultyLevel: {
            type: Type.STRING,
            description: 'Assessed difficulty level: beginner, intermediate, or advanced',
          },
        },
        required: [
          'originalSentence',
          'correctedSentence',
          'grammarFeedback',
          'vocabularyFeedback',
          'overallFeedback',
          'difficultyLevel',
        ],
      },
    };

    // Try fast, highly available models in priority order.
    // gemini-3-flash-preview and gemini-3.1-flash-lite have proven high availability
    const candidateModels = [
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite',
      'gemini-3.1-flash-lite-preview',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
    ];
    let response: any = null;
    let lastError: any = null;

    // Helper to attempt generation with fallback to omit thinkingConfig if model rejects it
    const tryGenerate = async (model: string, withThinking = true) => {
      const configToUse = withThinking
        ? analysisConfig
        : {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: analysisConfig.responseSchema,
          };

      try {
        return await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: configToUse,
        });
      } catch (err: any) {
        // If the error was 400 INVALID_ARGUMENT and we used thinkingConfig, retry immediately without it
        if (withThinking && err?.status === 400) {
          console.warn(`Model ${model} rejected thinkingConfig (400), retrying without thinkingConfig...`);
          return await tryGenerate(model, false);
        }
        throw err;
      }
    };

    // Pass 1: Iterate over candidate models
    for (const model of candidateModels) {
      try {
        console.log(`Analyzing sentence with model: ${model}...`);
        const candidateResponse = await tryGenerate(model, true);
        if (candidateResponse && candidateResponse.text) {
          response = candidateResponse;
          console.log(`Analysis succeeded with model ${model}`);
          break;
        }
      } catch (modelErr: any) {
        console.warn(`Analysis attempt failed with model ${model} (${modelErr?.status || modelErr?.message || modelErr}), trying next candidate...`);
        lastError = modelErr;
      }
    }

    // Pass 2: If all models temporarily threw 503/429 (transient traffic spike), wait 1s and retry top models
    if (!response || !response.text) {
      console.warn('Candidate models encountered transient rate/demand limits. Pausing 1000ms for second pass on top models...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      for (const retryModel of ['gemini-3-flash-preview', 'gemini-3.1-flash-lite']) {
        try {
          const retryResponse = await tryGenerate(retryModel, false);
          if (retryResponse && retryResponse.text) {
            response = retryResponse;
            console.log(`Second pass succeeded with model ${retryModel}`);
            break;
          }
        } catch (retryErr: any) {
          lastError = retryErr;
        }
      }
    }

    if (!response || !response.text) {
      // If AI service is completely unavailable, provide a graceful, constructive fallback
      console.error('All AI models temporarily unavailable:', lastError);
      return res.json({
        originalSentence: sentence.trim(),
        correctedSentence: sentence.trim(),
        grammarFeedback: [],
        vocabularyFeedback: [],
        overallFeedback: 'Your sentence has been recorded. Our AI tutor is currently experiencing high practice volume, but your speech was transcribed successfully. Please try analyzing again in a moment!',
        difficultyLevel: level,
      });
    }

    let rawJson = (response.text || '').trim();
    if (rawJson.startsWith('```json')) {
      rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    } else if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(rawJson);
    } catch {
      // Regex extraction fallback if LLM included surrounding prose
      const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = {
          originalSentence: sentence.trim(),
          correctedSentence: sentence.trim(),
          grammarFeedback: [],
          vocabularyFeedback: [],
          overallFeedback: rawJson || 'Great practice effort!',
          difficultyLevel: level,
        };
      }
    }

    // Ensure all required fields exist
    parsedData.originalSentence = parsedData.originalSentence || sentence.trim();
    parsedData.correctedSentence = parsedData.correctedSentence || sentence.trim();
    parsedData.grammarFeedback = Array.isArray(parsedData.grammarFeedback) ? parsedData.grammarFeedback : [];
    parsedData.vocabularyFeedback = Array.isArray(parsedData.vocabularyFeedback) ? parsedData.vocabularyFeedback : [];
    parsedData.overallFeedback = parsedData.overallFeedback || 'Great effort! Keep practicing.';
    parsedData.difficultyLevel = parsedData.difficultyLevel || level;

    res.json(parsedData);
  } catch (error: unknown) {
    console.error('Error in /api/analyze:', error);
    const msg = error instanceof Error ? error.message : 'Analysis failed';
    res.status(500).json({ error: sanitizeErrorMessage(msg) });
  }
});

/**
 * POST /api/speak
 * Text-to-Speech API for corrected sentences
 */
app.post(['/api/speak', '/speak'], async (req: Request, res: Response) => {
  try {
    const { text, language } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    const ai = getAIClient();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: text.trim() }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const audioBase64 =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (audioBase64) {
        return res.json({
          audioBase64,
          mimeType: 'audio/wav',
          format: 'pcm',
          provider: 'gemini-tts',
        });
      }
    } catch (ttsErr) {
      console.warn('Gemini TTS preview call returned without audio, client will use Web Speech synthesis:', ttsErr);
    }

    // Inform client that client-side native Web Speech API synthesis is available
    res.json({
      fallbackToBrowser: true,
      text,
      language: language || 'en-US',
    });
  } catch (error: unknown) {
    console.error('Error in /api/speak:', error);
    const msg = error instanceof Error ? error.message : 'TTS failed';
    res.status(500).json({ error: sanitizeErrorMessage(msg) });
  }
});

/**
 * GET /api/progress
 * Fetch practice session history
 */
app.get(['/api/progress', '/progress'], (req: Request, res: Response) => {
  res.json(practiceSessionsStore);
});

/**
 * POST /api/progress
 * Save a practice session record
 */
app.post(['/api/progress', '/progress'], (req: Request, res: Response) => {
  try {
    const sessionData = req.body as PracticeSessionRecord;
    if (sessionData && sessionData.id) {
      // Unshift to keep newest first
      const exists = practiceSessionsStore.some((s) => s.id === sessionData.id);
      if (!exists) {
        practiceSessionsStore.unshift(sessionData);
      }
    }
    res.json(practiceSessionsStore);
  } catch (error: unknown) {
    res.status(500).json({ error: 'Failed to record session' });
  }
});

// 404 handler for unmatched API routes so they return JSON, never the SPA index.html
app.all(['/api/*', '/analyze', '/transcribe', '/speak', '/health', '/progress'], (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// Global error handler for uncaught server errors (registered on app for both server & serverless)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({
    error: sanitizeErrorMessage(err?.message || 'Internal server error'),
  });
});

// ====================================================
// VITE / STATIC SERVING & SPA FALLBACK
// ====================================================

async function startServer() {
  const isCompiledBundle = typeof __filename !== 'undefined' && __filename.endsWith('.cjs');
  const isProduction = process.env.NODE_ENV === 'production' || isCompiledBundle;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.resolve(process.cwd(), 'dist'))
      ? path.resolve(process.cwd(), 'dist')
      : typeof __dirname !== 'undefined'
      ? __dirname
      : path.resolve(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Voice Language Tutor server listening on http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

// In standard environments (local dev, Render, Railway, Docker, Cloud Run), start the Express HTTP listener.
// On Vercel serverless platform, Vercel invokes the exported app directly.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
