import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useChatbot } from '@/hooks/use-chatbot';
import { ChatMessage } from './ChatMessage';
import { ChatHistory } from './ChatHistory';
import { 
  Plus, 
  History, 
  Send, 
  X, 
  MessageSquare, 
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { 
    sessions, 
    currentSession, 
    currentSessionId, 
    setCurrentSessionId, 
    startNewSession, 
    sendMessage,
    isProcessing 
  } = useChatbot();

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
      {/* Header */}
      <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Cockpit Assistant</h2>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 font-medium">Assistant intelligent actif</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={() => {
               setShowHistory(false);
               startNewSession();
            }}
            title="Nouvelle discussion"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8 rounded-full", showHistory && "bg-slate-100 dark:bg-slate-800")} 
            onClick={() => setShowHistory(!showHistory)}
            title="Historique"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
        {showHistory ? (
          <ChatHistory 
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={setCurrentSessionId}
            onClose={() => setShowHistory(false)}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 px-6">
              {!currentSession || currentSession.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 pt-10">
                  <div className="space-y-2">
                    <div className="h-16 w-16 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6">
                       <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Bienvenue, {user?.firstName || 'utilisateur'}.
                    </h3>
                    <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                      Je suis l'assistant intelligent de Cockpit. Je peux vous aider à analyser vos données financières et opérationnelles.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 w-full max-w-[300px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Suggestions</p>
                    {[
                      "Quel est mon chiffre d'affaires ?",
                      "Analysez le DSO par client",
                      "Prévisions de trésorerie"
                    ].map((s, i) => (
                      <button 
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="text-left p-3 text-xs bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all font-medium text-slate-600 dark:text-slate-300"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {currentSession.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* Input */}
            <div className="p-4 px-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
               <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 pr-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <textarea
                    className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none resize-none focus:ring-0 text-sm py-2 px-3 placeholder:text-slate-400"
                    placeholder="Posez votre question..."
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <Button 
                    size="icon" 
                    className={cn(
                      "h-9 w-9 rounded-xl shrink-0 transition-all",
                      input.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    )}
                    onClick={handleSend}
                    disabled={!input.trim() || isProcessing}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
               </div>
               <p className="text-[9px] text-center text-slate-400 mt-2">
                 L'IA peut faire des erreurs. Vérifiez les informations importantes.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
