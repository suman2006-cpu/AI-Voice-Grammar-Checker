import React, { useState } from 'react';
import { Header } from '../components/Header';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { Practice } from './Practice';
import { Progress } from './Progress';

export const Home: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'practice' | 'progress'>('practice');
  const session = usePracticeSession();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Sticky Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedLanguage={session.selectedLanguage}
        onSelectLanguage={session.setSelectedLanguage}
        totalSessions={session.progressSummary.totalSessions}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'practice' ? (
          <Practice session={session} />
        ) : (
          <Progress
            session={session}
            onStartPractice={() => setCurrentTab('practice')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Voice Language Tutor &bull; Speech-to-Text &bull; Gemini LLM Grammar &bull; Text-to-Speech</span>
          <span className="text-slate-400 dark:text-slate-500">Adaptive Difficulty &bull; Progress Tracking</span>
        </div>
      </footer>
    </div>
  );
};

