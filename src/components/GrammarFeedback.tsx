import React from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { GrammarFeedbackItem } from '../types/feedback';

interface GrammarFeedbackProps {
  items: GrammarFeedbackItem[];
  fullOriginalSentence: string;
  fullCorrectedSentence: string;
}

export const GrammarFeedback: React.FC<GrammarFeedbackProps> = ({
  items,
  fullOriginalSentence,
  fullCorrectedSentence,
}) => {
  if (!items || items.length === 0) {
    return (
      <div id="grammar-feedback-empty" className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Flawless Grammar</h4>
          <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5">
            No grammatical mistakes were detected in your sentence. Great job!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="grammar-feedback-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Grammar Points ({items.length})
        </h4>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            id={`grammar-item-${index}`}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/90 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-600"
          >
            {/* Incorrect vs Correct comparison */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-semibold">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200/80 dark:border-rose-900/60">
                <XCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="text-xs text-rose-500 dark:text-rose-400 font-normal">Incorrect:</span>
                <span className="line-through">{item.original || fullOriginalSentence}</span>
              </div>

              <ArrowRight className="hidden sm:block w-4 h-4 text-slate-400 shrink-0" />

              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-900/60">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal">Correct:</span>
                <span>{item.corrected || fullCorrectedSentence}</span>
              </div>
            </div>

            {/* Simple clear explanation */}
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pl-1 border-l-2 border-indigo-400 dark:border-indigo-500">
              <span className="font-semibold text-slate-800 dark:text-slate-100">Explanation: </span>
              {item.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
