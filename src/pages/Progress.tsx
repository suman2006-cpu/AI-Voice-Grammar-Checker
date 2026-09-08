import React from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { TextToSpeechService } from '../services/textToSpeechService';
import { SUPPORTED_LANGUAGES } from '../types/language';

interface ProgressProps {
  session: ReturnType<typeof usePracticeSession>;
  onStartPractice: () => void;
}

export const Progress: React.FC<ProgressProps> = ({ session, onStartPractice }) => {
  const { progressSummary, sessions, clearHistory } = session;

  const handlePlaySentence = (text: string, languageName: string) => {
    const matchedLang = SUPPORTED_LANGUAGES.find(
      (l) => l.name.toLowerCase() === languageName.toLowerCase()
    );
    TextToSpeechService.speak(text, matchedLang?.locale || 'en-US');
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="progress-dashboard" className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sessions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Practice Sessions</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{progressSummary.totalSessions}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recorded sentences</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Flawless Sentences</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{progressSummary.accuracyRate}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{progressSummary.perfectSentences} with 0 errors</p>
        </div>

        {/* Total Grammar Corrections */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Grammar Fixes</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{progressSummary.totalGrammarMistakes}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Identified & explained</p>
        </div>

        {/* Recommended Level */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Adaptive Level</span>
            <TrendingUp className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-extrabold text-violet-600 dark:text-violet-400 capitalize">
            {progressSummary.recommendedDifficulty}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI recommended tier</p>
        </div>
      </div>

      {/* Common Grammar Mistakes & Vocabulary Improvement Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Grammar Mistakes */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Frequent Grammar Insights</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Patterns detected across your practice</p>
            </div>
          </div>

          {progressSummary.commonMistakes.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              No repeated mistakes recorded yet. Keep practicing!
            </div>
          ) : (
            <div className="space-y-2">
              {progressSummary.commonMistakes.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs sm:text-sm"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.mistake}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                    {item.count} {item.count === 1 ? 'time' : 'times'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vocabulary Improvement Log */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Vocabulary Expansion Log</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Natural synonyms and advanced word choices</p>
            </div>
          </div>

          {progressSummary.vocabularyImprovements.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              No vocabulary suggestions recorded yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {progressSummary.vocabularyImprovements.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-800/60 text-xs sm:text-sm"
                >
                  <span className="text-slate-500 dark:text-slate-400 line-through">&ldquo;{item.word}&rdquo;</span>
                  <span className="font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    &ldquo;{item.suggestion}&rdquo;
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Practice History Session List */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Practice History</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Review all your previous sentences and listen to corrections</p>
            </div>
          </div>

          {sessions.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              You haven&apos;t recorded any sentences yet. Start your first session!
            </p>
            <button
              type="button"
              onClick={onStartPractice}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              Start Practicing
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {sess.targetLanguage}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">{formatDate(sess.date)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      sess.grammarMistakes === 0
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                    }`}>
                      {sess.grammarMistakes === 0 ? '✓ Flawless' : `${sess.grammarMistakes} mistakes`}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold mr-1.5">Spoken:</span>
                    <span className="text-slate-600 dark:text-slate-300">&ldquo;{sess.originalSentence}&rdquo;</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mr-1.5">Corrected:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">&ldquo;{sess.correctedSentence}&rdquo;</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlaySentence(sess.correctedSentence, sess.targetLanguage)}
                      className="shrink-0 p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-600 transition-colors shadow-xs text-slate-700 dark:text-slate-200"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
