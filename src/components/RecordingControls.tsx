import React from 'react';
import { RotateCcw, Square, X } from 'lucide-react';

interface RecordingControlsProps {
  onStop: () => void;
  onCancel: () => void;
  onRestart: () => void;
  durationSeconds: number;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  onStop,
  onCancel,
  onRestart,
  durationSeconds,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div id="recording-controls" className="flex items-center justify-center gap-3 mt-4 animate-in fade-in duration-200">
      {/* Cancel recording */}
      <button
        id="cancel-recording-btn"
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors"
        title="Cancel and discard audio"
      >
        <X className="w-3.5 h-3.5" />
        <span>Cancel</span>
      </button>

      {/* Primary Stop recording button */}
      <button
        id="stop-recording-btn"
        type="button"
        onClick={onStop}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md hover:shadow-lg transition-all active:scale-95"
      >
        <Square className="w-4 h-4 fill-white" />
        <span>Done Speaking ({formatTime(durationSeconds)})</span>
      </button>

      {/* Restart recording */}
      <button
        id="restart-recording-btn"
        type="button"
        onClick={onRestart}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors"
        title="Cancel and start recording again immediately"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Restart</span>
      </button>
    </div>
  );
};
