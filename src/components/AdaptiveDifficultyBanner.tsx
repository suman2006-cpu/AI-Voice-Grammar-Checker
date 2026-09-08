import React from 'react';
import { ArrowUpRight, Gauge, Sparkles } from 'lucide-react';
import { DifficultyLevel } from '../types/feedback';

interface AdaptiveDifficultyBannerProps {
  currentLevel: DifficultyLevel;
  recommendedLevel: DifficultyLevel;
  totalSentences: number;
  accuracyRate: number;
  onSelectLevel: (level: DifficultyLevel) => void;
}

export const AdaptiveDifficultyBanner: React.FC<AdaptiveDifficultyBannerProps> = ({
  currentLevel,
  recommendedLevel,
  totalSentences,
  accuracyRate,
  onSelectLevel,
}) => {
  const isRecommendedDifferent = currentLevel !== recommendedLevel && totalSentences >= 2;

  const descriptions: Record<DifficultyLevel, string> = {
    beginner: 'Short simple sentences, basic everyday grammar & vocabulary',
    intermediate: 'Longer phrases, multiple tenses & descriptive vocabulary',
    advanced: 'Complex clauses, idioms, subjunctive structures & nuanced phrasing',
  };

  return (
    <div id="adaptive-difficulty-banner" className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
          <Gauge className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Level:</span>
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 capitalize">{currentLevel}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {descriptions[currentLevel]}
          </p>
        </div>
      </div>

      {/* Adaptive Level Buttons & Recommendation */}
      <div className="flex flex-wrap items-center gap-2">
        {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => onSelectLevel(lvl)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              currentLevel === lvl
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lvl}
          </button>
        ))}

        {isRecommendedDifferent && (
          <button
            type="button"
            onClick={() => onSelectLevel(recommendedLevel)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors animate-pulse"
            title={`Based on your ${accuracyRate}% accuracy across ${totalSentences} sentences`}
          >
            <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            <span>Switch to {recommendedLevel}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
