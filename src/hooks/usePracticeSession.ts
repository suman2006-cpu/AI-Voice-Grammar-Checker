import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiService } from '../services/apiService';
import { AnalysisResponse, DifficultyLevel } from '../types/feedback';
import { Language, SUPPORTED_LANGUAGES } from '../types/language';
import { PracticeSession, ProgressSummary } from '../types/practiceSession';

const STORAGE_KEY_SESSIONS = 'ai_voice_tutor_sessions_v1';
const STORAGE_KEY_LANGUAGE = 'ai_voice_tutor_language_v1';
const STORAGE_KEY_DIFFICULTY = 'ai_voice_tutor_difficulty_v1';

export function usePracticeSession() {
  // Target language
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const savedCode = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === savedCode);
    return found || SUPPORTED_LANGUAGES[0]; // Default English
  });

  // Current session states
  const [transcript, setTranscript] = useState<string>('');
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);
  const [editedTranscript, setEditedTranscript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Difficulty level
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DIFFICULTY);
    if (saved === 'beginner' || saved === 'intermediate' || saved === 'advanced') {
      return saved as DifficultyLevel;
    }
    return 'beginner';
  });

  // Saved practice history
  const [sessions, setSessions] = useState<PracticeSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save selected language changes
  const handleSelectLanguage = useCallback((lang: Language) => {
    setSelectedLanguage(lang);
    localStorage.setItem(STORAGE_KEY_LANGUAGE, lang.code);
  }, []);

  // Save difficulty changes
  const handleSelectDifficulty = useCallback((diff: DifficultyLevel) => {
    setDifficultyLevel(diff);
    localStorage.setItem(STORAGE_KEY_DIFFICULTY, diff);
  }, []);

  // Sync with backend API on mount
  useEffect(() => {
    ApiService.getProgress().then((remoteSessions) => {
      if (remoteSessions && remoteSessions.length > 0) {
        setSessions((current) => {
          // Merge remote sessions by id if not already present
          const existingIds = new Set(current.map((s) => s.id));
          const toAdd = remoteSessions.filter((s) => !existingIds.has(s.id));
          if (toAdd.length > 0) {
            const merged = [...toAdd, ...current];
            localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(merged));
            return merged;
          }
          return current;
        });
      }
    }).catch(() => {});
  }, []);

  // Set transcript and prepare editable copy
  const handleSetTranscript = useCallback((text: string) => {
    setTranscript(text);
    setEditedTranscript(text);
  }, []);

  // Run LLM grammar and vocabulary analysis
  const analyzeSentence = useCallback(async (sentenceToAnalyze?: string) => {
    const text = (sentenceToAnalyze !== undefined ? sentenceToAnalyze : (isEditingTranscript ? editedTranscript : transcript)).trim();

    if (!text) {
      setAnalysisError('Please provide a spoken or written sentence to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await ApiService.analyze(text, selectedLanguage.name, difficultyLevel);
      setAnalysisResult(result);
      setTranscript(text);
      setIsEditingTranscript(false);

      // Create new session record
      const newSession: PracticeSession = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        date: new Date().toISOString(),
        targetLanguage: selectedLanguage.name,
        originalSentence: result.originalSentence || text,
        correctedSentence: result.correctedSentence || text,
        grammarMistakes: (result.grammarFeedback || []).length,
        grammarFeedback: result.grammarFeedback || [],
        vocabularyFeedback: result.vocabularyFeedback || [],
        overallFeedback: result.overallFeedback || '',
        difficultyLevel: (result.difficultyLevel as DifficultyLevel) || difficultyLevel,
      };

      setSessions((prev) => {
        const updated = [newSession, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      // Save to backend asynchronously
      ApiService.saveSession(newSession).catch(() => {});

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAnalysisError(`Analysis failed: ${msg}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [difficultyLevel, editedTranscript, isEditingTranscript, selectedLanguage.name, transcript]);

  // Reset current session to practice again
  const resetSession = useCallback(() => {
    setTranscript('');
    setEditedTranscript('');
    setIsEditingTranscript(false);
    setAnalysisResult(null);
    setAnalysisError(null);
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
  }, []);

  // Compute progress summary
  const progressSummary: ProgressSummary = useMemo(() => {
    const totalSessions = sessions.length;
    const totalSentences = sessions.length;
    let totalGrammarMistakes = 0;
    let perfectSentences = 0;
    const mistakeCounts: { [mistake: string]: number } = {};
    const vocabList: { word: string; suggestion: string }[] = [];
    const sessionsByDate: { [date: string]: number } = {};

    sessions.forEach((s) => {
      totalGrammarMistakes += s.grammarMistakes;
      if (s.grammarMistakes === 0) {
        perfectSentences += 1;
      }

      // Group dates (YYYY-MM-DD)
      const dateKey = s.date.split('T')[0] || 'Unknown';
      sessionsByDate[dateKey] = (sessionsByDate[dateKey] || 0) + 1;

      // Track common mistakes
      s.grammarFeedback?.forEach((g) => {
        const key = `${g.original} → ${g.corrected}`;
        mistakeCounts[key] = (mistakeCounts[key] || 0) + 1;
      });

      // Track vocab suggestions
      s.vocabularyFeedback?.forEach((v) => {
        if (v.word && v.suggestion) {
          vocabList.push({ word: v.word, suggestion: v.suggestion });
        }
      });
    });

    const commonMistakes = Object.entries(mistakeCounts)
      .map(([mistake, count]) => ({ mistake, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const accuracyRate = totalSentences > 0
      ? Math.round((perfectSentences / totalSentences) * 100)
      : 100;

    // Adaptive difficulty calculation based on learner's historical accuracy and sentence count
    let recommendedDifficulty: DifficultyLevel = 'beginner';
    if (totalSentences >= 3) {
      if (accuracyRate >= 80 && totalGrammarMistakes <= 2) {
        recommendedDifficulty = 'advanced';
      } else if (accuracyRate >= 50) {
        recommendedDifficulty = 'intermediate';
      } else {
        recommendedDifficulty = 'beginner';
      }
    } else {
      recommendedDifficulty = difficultyLevel;
    }

    return {
      totalSessions,
      totalSentences,
      totalGrammarMistakes,
      perfectSentences,
      accuracyRate,
      commonMistakes,
      vocabularyImprovements: vocabList.slice(0, 10),
      sessionsByDate,
      recommendedDifficulty,
    };
  }, [difficultyLevel, sessions]);

  return {
    selectedLanguage,
    setSelectedLanguage: handleSelectLanguage,
    difficultyLevel,
    setDifficultyLevel: handleSelectDifficulty,
    transcript,
    setTranscript: handleSetTranscript,
    isEditingTranscript,
    setIsEditingTranscript,
    editedTranscript,
    setEditedTranscript,
    isAnalyzing,
    analysisResult,
    analysisError,
    analyzeSentence,
    resetSession,
    sessions,
    progressSummary,
    clearHistory,
  };
}
