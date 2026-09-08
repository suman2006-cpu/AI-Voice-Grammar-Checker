import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AdaptiveDifficultyBanner } from '../components/AdaptiveDifficultyBanner';
import { AudioRecorder } from '../components/AudioRecorder';
import { CorrectedSentenceCard } from '../components/CorrectedSentenceCard';
import { FeedbackCard } from '../components/FeedbackCard';
import { TranscriptCard } from '../components/TranscriptCard';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { usePracticeSession } from '../hooks/usePracticeSession';

interface PracticeProps {
  session: ReturnType<typeof usePracticeSession>;
}

export const Practice: React.FC<PracticeProps> = ({ session }) => {
  const {
    selectedLanguage,
    difficultyLevel,
    setDifficultyLevel,
    transcript,
    setTranscript,
    isAnalyzing,
    analysisResult,
    analysisError,
    analyzeSentence,
    resetSession,
    progressSummary,
  } = session;

  // Audio recording hook
  const {
    state: recordingState,
    error: recordingError,
    audioLevel,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    restartRecording,
  } = useAudioRecording({
    language: selectedLanguage.code,
    onTranscriptionComplete: (text) => {
      setTranscript(text);
      // Automatically trigger LLM analysis on successful transcription
      analyzeSentence(text);
    },
  });

  // Trigger celebration confetti if the learner has 0 grammar mistakes
  useEffect(() => {
    if (analysisResult && (analysisResult.grammarFeedback || []).length === 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }
  }, [analysisResult]);

  const handleUseSampleText = (sample: string) => {
    setTranscript(sample);
    analyzeSentence(sample);
  };

  return (
    <div id="practice-page" className="space-y-6">
      {/* Adaptive Difficulty Bar */}
      <AdaptiveDifficultyBanner
        currentLevel={difficultyLevel}
        recommendedLevel={progressSummary.recommendedDifficulty}
        totalSentences={progressSummary.totalSentences}
        accuracyRate={progressSummary.accuracyRate}
        onSelectLevel={setDifficultyLevel}
      />

      {/* Main Recording Area */}
      <AudioRecorder
        state={recordingState}
        isAnalyzing={isAnalyzing}
        audioLevel={audioLevel}
        duration={duration}
        error={recordingError || analysisError}
        selectedLanguage={selectedLanguage}
        onStart={startRecording}
        onStop={stopRecording}
        onCancel={cancelRecording}
        onRestart={restartRecording}
        onUseSampleText={handleUseSampleText}
      />

      {/* Transcription Card: "What You Said" */}
      {transcript && (
        <TranscriptCard
          transcript={transcript}
          isAnalyzing={isAnalyzing}
          onEditSubmit={(edited) => setTranscript(edited)}
          onAnalyze={(sentence) => analyzeSentence(sentence)}
        />
      )}

      {/* Corrected Sentence Card */}
      {analysisResult && (
        <CorrectedSentenceCard
          originalSentence={analysisResult.originalSentence || transcript}
          correctedSentence={analysisResult.correctedSentence}
          language={selectedLanguage}
          onPracticeAgain={resetSession}
        />
      )}

      {/* AI Feedback Card */}
      {analysisResult && (
        <FeedbackCard analysis={analysisResult} />
      )}
    </div>
  );
};
