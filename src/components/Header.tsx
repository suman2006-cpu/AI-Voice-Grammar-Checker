import React from 'react';
import { BarChart3, Languages, Moon, Sparkles, Sun, Volume2 } from 'lucide-react';
import { Language } from '../types/language';
import { LanguageSelector } from './LanguageSelector';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  currentTab: 'practice' | 'progress';
  onSelectTab: (tab: 'practice' | 'progress') => void;
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
  totalSessions: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  selectedLanguage,
  onSelectLanguage,
  totalSessions,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* App Branding */}
        <div 
          onClick={() => onSelectTab('practice')}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="app-branding"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                AI Voice Language Tutor
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="w-3 h-3 mr-1" />
                Gemini Powered
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
              Speak, receive instant grammar feedback & listen to corrections
            </p>
          </div>
        </div>

        {/* Language Selector, Theme Toggle & Navigation Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={onSelectLanguage}
          />

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-button"
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all duration-150 shadow-xs active:scale-95"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
            <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
          </button>

          <button
            id="nav-progress-button"
            type="button"
            onClick={() => onSelectTab(currentTab === 'practice' ? 'progress' : 'practice')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 border ${
              currentTab === 'progress'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {currentTab === 'progress' ? (
              <>
                <Languages className="w-4 h-4" />
                <span>Practice</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                <span>Progress</span>
                {totalSessions > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold">
                    {totalSessions}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
