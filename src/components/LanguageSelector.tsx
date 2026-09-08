import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES } from '../types/language';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        id="language-selector-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-xs"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{selectedLanguage.flag}</span>
        <span className="max-w-[80px] sm:max-w-none truncate font-medium">{selectedLanguage.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="language-dropdown-menu"
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Target Language</span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === selectedLanguage.code;
              return (
                <button
                  key={lang.code}
                  id={`language-option-${lang.code}`}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-sm transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl leading-none">{lang.flag}</span>
                    <div>
                      <div className="leading-tight">{lang.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-400 font-normal">{lang.nativeName}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
