import { useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-4">
      {isOpen && (
        <ChatWindow onClose={() => setIsOpen(false)} />
      )}
      
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group overflow-hidden",
          isOpen 
            ? "bg-slate-900 border border-slate-700 text-white rotate-90" 
            : "bg-blue-600 hover:bg-blue-700 text-white"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative h-full w-full flex items-center justify-center">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {isOpen ? (
              <Sparkles className="h-6 w-6 animate-pulse" />
            ) : (
              <MessageSquare className="h-6 w-6" />
            )}
        </div>
      </Button>
      
      {!isOpen && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-right-3 duration-500 pointer-events-none hidden md:block">
           <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
             Besoin d'aide ? <span className="text-blue-500">Demandez à Zuri</span>
           </span>
        </div>
      )}
    </div>
  );
}
