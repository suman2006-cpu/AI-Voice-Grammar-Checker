import React from 'react';
import { CheckCircle2, RotateCw, Volume2 } from 'lucide-react';
import { Language } from '../types/language';
import { AudioPlayer } from './AudioPlayer';

interface CorrectedSentenceCardProps {
  originalSentence: string;
  correctedSentence: string;
  language: Language;
  onPracticeAgain: () => void;
}

export const CorrectedSentenceCard: React.FC<CorrectedSentenceCardProps> = ({
  originalSentence,
  correctedSentence,
  language,
  onPracticeAgain,
}) => {
  const isIdentical = originalSentence.trim().toLowerCase() === correctedSentence.trim().toLowerCase();

  return (
    <section id="corrected-sentence-card" className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Corrected Sentence</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Natural native expression in {language.name}</p>
          </div>
        </div>

        {/* Practice Again button */}
        <button
          id="practice-again-btn"
          type="button"
          onClick={onPracticeAgain}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 transition-colors shadow-xs active:scale-95"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Practice Again</span>
        </button>
      </div>

      {/* Prominent Corrected Sentence Display */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60">
        <p id="corrected-sentence-text" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed tracking-tight">
          &ldquo;{correctedSentence}&rdquo;
        </p>

        {isIdentical && (
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Your sentence was completely natural and grammatically accurate!
          </p>
        )}
      </div>

      {/* Modular TTS Audio Player with Listen, Play, Stop, Replay, Speed */}
      <AudioPlayer
        textToSpeak={correctedSentence}
        language={language}
      />
    </section>
  );
};
