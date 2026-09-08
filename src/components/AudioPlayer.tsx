import React, { useEffect, useState } from 'react';
import { Loader2, Pause, Play, RotateCcw, Square, Volume2 } from 'lucide-react';
import { TextToSpeechService, TTSStatus } from '../services/textToSpeechService';
import { Language } from '../types/language';

interface AudioPlayerProps {
  textToSpeak: string;
  language: Language;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  textToSpeak,
  language,
}) => {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    TextToSpeechService.setCallbacks({
      onStatusChange: (newStatus) => setStatus(newStatus),
      onError: (err) => setError(err),
    });

    return () => {
      TextToSpeechService.stop();
    };
  }, []);

  const handlePlay = async () => {
    setError(null);
    try {
      TextToSpeechService.setPlaybackRate(playbackRate);
      await TextToSpeechService.speak(textToSpeak, language.locale);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Speech synthesis failed';
      setError(msg);
    }
  };

  const handlePause = () => {
    TextToSpeechService.pause();
  };

  const handleResume = () => {
    TextToSpeechService.resume();
  };

  const handleStop = () => {
    TextToSpeechService.stop();
  };

  const handleReplay = () => {
    TextToSpeechService.stop();
    setTimeout(() => {
      handlePlay();
    }, 150);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    TextToSpeechService.setPlaybackRate(rate);
  };

  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isLoading = status === 'loading';

  return (
    <div id="audio-player-controls" className="w-full bg-slate-50/90 dark:bg-slate-800/70 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Main Action: Listen to Corrected Sentence */}
        <div className="flex items-center gap-2">
          {!isPlaying && !isPaused ? (
            <button
              id="listen-corrected-sentence-btn"
              type="button"
              disabled={isLoading || !textToSpeak}
              onClick={handlePlay}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span>Listen to Corrected Sentence</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {isPlaying ? (
                <button
                  id="pause-tts-btn"
                  type="button"
                  onClick={handlePause}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-xs"
                >
                  <Pause className="w-4 h-4 fill-slate-800 dark:fill-slate-100" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  id="resume-tts-btn"
                  type="button"
                  onClick={handleResume}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume</span>
                </button>
              )}

              <button
                id="stop-tts-btn"
                type="button"
                onClick={handleStop}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 transition-colors"
                title="Stop Audio"
              >
                <Square className="w-3.5 h-3.5 fill-rose-700 dark:fill-rose-300" />
                <span>Stop</span>
              </button>

              <button
                id="replay-tts-btn"
                type="button"
                onClick={handleReplay}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-xs"
                title="Replay from start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            </div>
          )}

          {/* Audio Visualizer Waves when playing */}
          {isPlaying && (
            <div className="flex items-center gap-1 h-6 px-2">
              <span className="w-1 h-3 bg-indigo-600 rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-indigo-600 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-indigo-600 rounded-full animate-pulse delay-150" />
              <span className="w-1 h-4 bg-indigo-600 rounded-full animate-pulse delay-100" />
            </div>
          )}
        </div>

        {/* Speed / Rate Selector */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">Speed:</span>
          {[0.75, 1.0, 1.25].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRateChange(rate)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
              }`}
            >
              {rate === 0.75 ? '0.75x (Slow)' : `${rate}x`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
};
