import React, { useState } from 'react';
import { Check, Edit3, MessageSquare, Sparkles, X } from 'lucide-react';

interface TranscriptCardProps {
  transcript: string;
  isAnalyzing: boolean;
  onEditSubmit: (newText: string) => void;
  onAnalyze: (sentence: string) => void;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  transcript,
  isAnalyzing,
  onEditSubmit,
  onAnalyze,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(transcript);

  // Sync draft when transcript changes
  React.useEffect(() => {
    setDraft(transcript);
  }, [transcript]);

  if (!transcript && !isEditing) {
    return null;
  }

  const handleSaveAndAnalyze = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onEditSubmit(trimmed);
      setIsEditing(false);
      onAnalyze(trimmed);
    }
  };

  const handleSaveOnly = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onEditSubmit(trimmed);
      setIsEditing(false);
    }
  };

  return (
    <div id="transcription-card" className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200 transition-colors duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">What You Said</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Transcribed from your microphone audio</p>
          </div>
        </div>

        {!isEditing && (
          <button
            id="edit-transcript-btn"
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Speech</span>
          </button>
        )}
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              id="transcript-edit-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Type or correct your sentence here..."
              className="w-full px-4 py-3 rounded-2xl border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-800 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg font-medium outline-none resize-none transition-all"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(transcript);
                  setIsEditing(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveOnly}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                id="save-and-analyze-btn"
                type="button"
                disabled={isAnalyzing || !draft.trim()}
                onClick={handleSaveAndAnalyze}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save & Analyze</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p id="transcript-display-text" className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              &ldquo;{transcript}&rdquo;
            </p>

            <button
              id="analyze-transcript-btn"
              type="button"
              disabled={isAnalyzing}
              onClick={() => onAnalyze(transcript)}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm hover:shadow transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Sentence'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
