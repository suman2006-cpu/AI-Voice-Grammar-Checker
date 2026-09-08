import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { VocabularyFeedbackItem } from '../types/feedback';

interface VocabularyFeedbackProps {
  items: VocabularyFeedbackItem[];
}

export const VocabularyFeedback: React.FC<VocabularyFeedbackProps> = ({ items }) => {
  // Filter out any empty items
  const validItems = (items || []).filter(
    (item) => item && (item.word || item.suggestion || item.explanation)
  );

  if (validItems.length === 0) {
    return null; // As requested: "Show vocabulary suggestions only when relevant."
  }

  return (
    <div id="vocabulary-feedback-section" className="space-y-3">
      <div className="flex items-center gap-1.5">
        <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Vocabulary & Word Choice Suggestions ({validItems.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {validItems.map((item, index) => (
          <div
            key={index}
            id={`vocabulary-item-${index}`}
            className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/80 space-y-2"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {item.word && (
                <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                  <span className="text-xs text-slate-400 dark:text-slate-500 mr-1.5 font-medium">Original:</span>
                  <span className="font-semibold">&ldquo;{item.word}&rdquo;</span>
                </div>
              )}

              <span className="text-xs text-violet-500 dark:text-violet-400 font-bold">→</span>

              {item.suggestion && (
                <div className="px-2.5 py-1 rounded-lg bg-violet-600 text-white font-semibold flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs text-violet-200 mr-1 font-normal">Suggestion:</span>
                  <span>&ldquo;{item.suggestion}&rdquo;</span>
                </div>
              )}
            </div>

            {item.explanation && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pl-1 border-l-2 border-violet-400 dark:border-violet-500">
                <span className="font-semibold text-slate-800 dark:text-slate-100">Explanation: </span>
                {item.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
