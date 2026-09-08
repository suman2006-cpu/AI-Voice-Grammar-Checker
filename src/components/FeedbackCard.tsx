import React from 'react';
import { Award, HeartHandshake, Sparkles } from 'lucide-react';
import { AnalysisResponse } from '../types/feedback';
import { GrammarFeedback } from './GrammarFeedback';
import { VocabularyFeedback } from './VocabularyFeedback';

interface FeedbackCardProps {
  analysis: AnalysisResponse;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ analysis }) => {
  const grammarCount = (analysis.grammarFeedback || []).length;
  const vocabCount = (analysis.vocabularyFeedback || []).filter(
    (v) => v.word || v.suggestion
  ).length;

  return (
    <section id="ai-feedback" className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">AI Feedback</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive grammar, vocabulary, and phrasing review</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          {analysis.difficultyLevel && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Level: {analysis.difficultyLevel}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            grammarCount === 0 
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}>
            {grammarCount === 0 ? '✓ Perfect Accuracy' : `${grammarCount} Grammar ${grammarCount === 1 ? 'Tip' : 'Tips'}`}
          </span>
        </div>
      </div>

      {/* OVERALL FEEDBACK */}
      {analysis.overallFeedback && (
        <div id="overall-feedback-card" className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              Tutor Guidance & Encouragement
            </h4>
            <p id="overall-feedback-text" className="text-sm sm:text-base text-indigo-950 dark:text-indigo-200 font-medium mt-1 leading-relaxed">
              &ldquo;{analysis.overallFeedback}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* GRAMMAR SECTION */}
      <GrammarFeedback
        items={analysis.grammarFeedback || []}
        fullOriginalSentence={analysis.originalSentence}
        fullCorrectedSentence={analysis.correctedSentence}
      />

      {/* VOCABULARY SECTION (shown only when relevant) */}
      <VocabularyFeedback items={analysis.vocabularyFeedback || []} />
    </section>
  );
};
