import { DifficultyLevel, GrammarFeedbackItem, VocabularyFeedbackItem } from './feedback';

export interface PracticeSession {
  id: string;
  date: string;
  targetLanguage: string;
  originalSentence: string;
  correctedSentence: string;
  grammarMistakes: number;
  grammarFeedback?: GrammarFeedbackItem[];
  vocabularyFeedback?: VocabularyFeedbackItem[];
  overallFeedback?: string;
  difficultyLevel: DifficultyLevel | string;
}

export interface ProgressSummary {
  totalSessions: number;
  totalSentences: number;
  totalGrammarMistakes: number;
  perfectSentences: number;
  accuracyRate: number; // percentage
  commonMistakes: { mistake: string; count: number }[];
  vocabularyImprovements: { word: string; suggestion: string }[];
  sessionsByDate: { [date: string]: number };
  recommendedDifficulty: DifficultyLevel;
}
