import { ChatSession } from '@/hooks/use-chatbot';
import { History, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onClose: () => void;
}

export function ChatHistory({ sessions, currentSessionId, onSelectSession, onClose }: ChatHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) return "Aujourd'hui";
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm">Historique des discussions</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Retour
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center p-4">
            <MessageSquare className="h-8 w-8 text-slate-200 mb-2" />
            <p className="text-xs text-slate-400">Aucune discussion enregistrée</p>
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                onClose();
              }}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all group relative",
                currentSessionId === session.id 
                  ? "bg-primary/5 border-primary/20 border" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent border"
              )}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {formatDate(session.updatedAt)}
                  </span>
                  {currentSessionId === session.id && (
                     <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  )}
                </div>
                <h4 className={cn(
                  "text-xs font-bold truncate pr-4",
                  currentSessionId === session.id ? "text-primary" : "text-slate-700 dark:text-slate-200"
                )}>
                  {session.title}
                </h4>
                {session.messages[0] && (
                  <p className="text-[10px] text-slate-400 truncate line-clamp-1 italic">
                    {session.messages[0].content}
                  </p>
                )}
              </div>
              <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
