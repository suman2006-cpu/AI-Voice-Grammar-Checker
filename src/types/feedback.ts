export interface GrammarFeedbackItem {
  original: string;
  corrected: string;
  explanation: string;
}

export interface VocabularyFeedbackItem {
  word: string;
  suggestion: string;
  explanation: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface AnalysisResponse {
  originalSentence: string;
  correctedSentence: string;
  grammarFeedback: GrammarFeedbackItem[];
  vocabularyFeedback: VocabularyFeedbackItem[];
  overallFeedback: string;
  difficultyLevel: DifficultyLevel | string;
}

export interface TranscribeResponse {
  transcript: string;
  language?: string;
  durationSeconds?: number;
}

export interface SpeakRequest {
  text: string;
  language: string;
  rate?: number;
}

export interface SpeakResponse {
  audioBase64?: string;
  mimeType?: string;
  format?: string;
  provider?: string;
}
