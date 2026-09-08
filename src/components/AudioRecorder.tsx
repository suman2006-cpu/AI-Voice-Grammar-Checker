import React, { useState } from 'react';
import { AlertCircle, Keyboard, Loader2, Mic, RefreshCw, Send, Sparkles } from 'lucide-react';
import { RecordingState } from '../hooks/useAudioRecording';
import { Language } from '../types/language';
import { RecordingControls } from './RecordingControls';

interface AudioRecorderProps {
  state: RecordingState;
  isAnalyzing: boolean;
  audioLevel: number;
  duration: number;
  error: string | null;
  selectedLanguage: Language;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  onRestart: () => void;
  onUseSampleText?: (sample: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  state,
  isAnalyzing,
  audioLevel,
  duration,
  error,
  selectedLanguage,
  onStart,
  onStop,
  onCancel,
  onRestart,
  onUseSampleText,
}) => {
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [typedInput, setTypedInput] = useState('');

  // Determine effective display state
  const effectiveState: RecordingState = isAnalyzing ? 'analyzing' : state;

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = typedInput.trim();
    if (trimmed && onUseSampleText) {
      onUseSampleText(trimmed);
      setTypedInput('');
      setIsTypingMode(false);
    }
  };

  const getStatusText = () => {
    switch (effectiveState) {
      case 'recording':
        return 'Listening...';
      case 'processing':
        return 'Transcribing your speech...';
      case 'analyzing':
        return 'Analyzing your sentence...';
      case 'idle':
      default:
        return 'Tap the microphone and start speaking';
    }
  };

  const getSubtext = () => {
    switch (effectiveState) {
      case 'recording':
        return `Speak naturally in ${selectedLanguage.name}`;
      case 'processing':
        return 'Converting spoken audio to text with speech recognition';
      case 'analyzing':
        return 'AI tutor is evaluating grammar, vocabulary & natural phrasing';
      case 'idle':
      default:
        return `Practice speaking in ${selectedLanguage.name} (${selectedLanguage.nativeName})`;
    }
  };

  // Generate 12 waveform bars based on live audioLevel
  const renderWaveform = () => {
    return (
      <div className="flex items-center justify-center gap-1.5 h-12 my-3 px-4">
        {[...Array(14)].map((_, i) => {
          // Add some pseudo-randomness based on audioLevel and index
          const multiplier = Math.sin((i / 14) * Math.PI);
          const barHeight = Math.max(
            8,
            Math.min(48, Math.round((audioLevel * multiplier * 0.9) + (Math.sin(Date.now() / 200 + i) * 6) + 12))
          );
          return (
            <div
              key={i}
              className="w-1.5 bg-rose-500 rounded-full transition-all duration-75"
              style={{
                height: `${barHeight}px`,
                opacity: 0.7 + (multiplier * 0.3),
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div id="main-recording-area" className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center transition-colors duration-200">
      {/* State Badge */}
      <div className="flex items-center justify-center mb-4">
        {effectiveState === 'recording' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            Live Recording
          </span>
        )}
        {effectiveState === 'processing' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
            STT Processing
          </span>
        )}
        {effectiveState === 'analyzing' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Gemini Analyzing
          </span>
        )}
        {effectiveState === 'idle' && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <span>Target:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">{selectedLanguage.name} {selectedLanguage.flag}</span>
          </span>
        )}
      </div>

      {/* Large Circular Microphone Button */}
      <div className="relative inline-flex items-center justify-center my-3">
        {/* Pulsing rings when recording */}
        {effectiveState === 'recording' && (
          <>
            <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping duration-1000 scale-125" />
            <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-pulse" />
          </>
        )}

        <button
          id="main-mic-button"
          type="button"
          disabled={effectiveState === 'processing' || effectiveState === 'analyzing'}
          onClick={() => {
            if (effectiveState === 'recording') {
              onStop();
            } else if (effectiveState === 'idle') {
              onStart();
            }
          }}
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-200 shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 ${
            effectiveState === 'recording'
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30'
              : effectiveState === 'processing' || effectiveState === 'analyzing'
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-500/25 hover:scale-105'
          }`}
          aria-label={effectiveState === 'recording' ? 'Stop recording' : 'Start recording'}
        >
          {effectiveState === 'processing' || effectiveState === 'analyzing' ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <Mic className={`w-10 h-10 sm:w-12 sm:h-12 ${effectiveState === 'recording' ? 'animate-bounce' : ''}`} />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider mt-1">
            {effectiveState === 'recording' ? 'Tap to Stop' : 'Tap to Speak'}
          </span>
        </button>
      </div>

      {/* Main Status Text & Animated Waveform */}
      <div className="mt-2 min-h-[50px]">
        <h2 id="recording-status-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {getStatusText()}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          {getSubtext()}
        </p>
      </div>

      {/* Real-time Waveform during recording */}
      {effectiveState === 'recording' && renderWaveform()}

      {/* Recording Controls (Stop, Cancel, Restart) */}
      {effectiveState === 'recording' && (
        <RecordingControls
          onStop={onStop}
          onCancel={onCancel}
          onRestart={onRestart}
          durationSeconds={duration}
        />
      )}

      {/* Error banner */}
      {error && (
        <div
          id="recording-error-banner"
          className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start justify-between gap-3 text-left max-w-lg mx-auto"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-rose-800 dark:text-rose-300">
              <p className="font-semibold">
                {error.toLowerCase().includes('analysis') || error.toLowerCase().includes('tutor')
                  ? 'Tutor Analysis Notice'
                  : 'Microphone Notice'}
              </p>
              <p className="mt-0.5 text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-800 text-rose-800 dark:text-rose-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Alternative Manual Text Input Toggle */}
      {effectiveState === 'idle' && onUseSampleText && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setIsTypingMode(!isTypingMode)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{isTypingMode ? 'Hide text input' : 'Or type / paste your sentence manually'}</span>
          </button>
        </div>
      )}

      {/* Manual Typing Form */}
      {effectiveState === 'idle' && isTypingMode && (
        <form onSubmit={handleTypedSubmit} className="mt-3 max-w-lg mx-auto flex items-center gap-2">
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={`Type a sentence in ${selectedLanguage.name}...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!typedInput.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Analyze</span>
          </button>
        </form>
      )}

      {/* Quick Inspiration Prompts when idle */}
      {effectiveState === 'idle' && onUseSampleText && (
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Need inspiration? Try saying:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {selectedLanguage.samplePrompts.beginner.slice(0, 2).map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onUseSampleText(sample)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all text-left"
                title="Use this example text"
              >
                &ldquo;{sample}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
