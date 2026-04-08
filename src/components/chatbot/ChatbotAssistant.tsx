import { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardEdit } from '@/context/DashboardEditContext';

export function ChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const { isSidebarOpen } = useDashboardEdit();

  // Affiche le label périodiquement : visible 4s toutes les 12s
  useEffect(() => {
    if (isOpen) return;

    // Premier affichage après 3s
    const initialDelay = setTimeout(() => setShowLabel(true), 3000);

    const interval = setInterval(() => {
      setShowLabel(true);
      setTimeout(() => setShowLabel(false), 4000);
    }, 12000);

    // Cache le label après 4s au premier affichage
    const firstHide = setTimeout(() => setShowLabel(false), 7000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(firstHide);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (isSidebarOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-4">
      {isOpen && (
        <ChatWindow onClose={() => setIsOpen(false)} />
      )}

      <div className="relative flex items-center">
        {/* Label périodique */}
        {!isOpen && (
          <div
            className={cn(
              'absolute right-16 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg whitespace-nowrap pointer-events-none hidden md:block transition-all duration-500',
              showLabel ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            )}
          >
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Besoin d'aide ? <span className="text-blue-500">Demandez à Zuri</span>
            </span>
          </div>
        )}

        {/* Chat button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none',
            isOpen ? 'scale-95' : ''
          )}
          aria-label="Ouvrir l'assistant Zuri"
        >
          {/* Fond dégradé bleu */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg" />

          {/* Halo animé */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full animate-ping bg-blue-400/30 pointer-events-none" />
          )}

          {/* Visage robot SVG */}
          <span className="relative z-10 flex items-center justify-center w-full h-full">
            {isOpen ? (
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            ) : (
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
                {/* Casque / corps robot */}
                <rect x="12" y="18" width="32" height="24" rx="8" fill="white" fillOpacity="0.95" />
                {/* Antenne */}
                <line x1="28" y1="18" x2="28" y2="11" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="28" cy="9" r="3" fill="white" />
                {/* Oreilles / boutons latéraux */}
                <rect x="9" y="26" width="4" height="8" rx="2" fill="white" fillOpacity="0.7" />
                <rect x="43" y="26" width="4" height="8" rx="2" fill="white" fillOpacity="0.7" />
                {/* Yeux */}
                <circle cx="22" cy="29" r="4" fill="#3b82f6" />
                <circle cx="34" cy="29" r="4" fill="#3b82f6" />
                <circle cx="23.5" cy="27.5" r="1.2" fill="white" />
                <circle cx="35.5" cy="27.5" r="1.2" fill="white" />
                {/* Bouche */}
                <path d="M22 36 Q28 40 34 36" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
