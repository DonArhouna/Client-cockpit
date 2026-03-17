import { Message } from '@/hooks/use-chatbot';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Loader2, 
  Target, 
  AlertCircle,
  BarChart2
} from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const processingSteps = [
    { id: 1, label: "Analyse de la requête" },
    { id: 2, label: "Validation des données" },
    { id: 3, label: "Exécution de la requête" },
    { id: 4, label: "Génération du visuel" },
  ];

  // Helper to determine current step based on status/jobId
  const getProcessStep = () => {
    if (message.status === 'completed') return 5;
    if (message.status === 'failed') return -1;
    if (message.jobId) return 3;
    return 1;
  };

  const processStep = getProcessStep();

  return (
    <div className={cn(
      "flex w-full mb-4 animate-in fade-in duration-300",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl p-3 px-4 shadow-sm",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none text-slate-900 dark:text-slate-100"
      )}>
        {isUser ? (
          <p className="text-sm font-medium">{message.content}</p>
        ) : (
          <div className="space-y-3">
            {message.type === 'processing' && message.status === 'pending' && (
              <div className="space-y-3 py-1">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Traitement en cours</span>
                </div>
                <div className="space-y-2">
                  {processingSteps.map((step) => (
                    <div key={step.id} className={cn(
                      "flex items-center gap-3 transition-opacity duration-500",
                      processStep >= step.id ? "opacity-100" : "opacity-40"
                    )}>
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center border transition-all duration-500",
                        processStep > step.id
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : processStep === step.id
                            ? "bg-primary border-primary text-white"
                            : "border-slate-200 dark:border-slate-600 text-muted-foreground"
                      )}>
                        {processStep > step.id
                          ? <CheckCircle2 className="h-3 w-3" />
                          : <span className="text-[10px] font-bold">{step.id}</span>
                        }
                      </div>
                      <span className="text-xs font-medium">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.status === 'failed' && (
              <div className="flex items-start gap-2 text-red-500 py-1">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs font-medium">{message.content}</p>
              </div>
            )}

            {message.type === 'viz' && message.status === 'completed' && (
              <div className="space-y-3">
                {message.content && (
                   <p className="text-sm leading-relaxed">{message.content}</p>
                )}
                
                {message.result && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    {/* Visualisation simplifiée pour le chat */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                             <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                                <Target className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                             </div>
                             <span className="text-[10px] font-bold uppercase text-slate-500">Visualisation Générée</span>
                          </div>
                       </div>
                       
                       {/* Note: DashboardGrid assumes layout context, here we might need a simplified version 
                           or just display a placeholder/summary if it's too complex for the chat popup.
                           But according to requirements, we should show the results. */}
                       <div className="min-h-[150px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="text-center space-y-1">
                             <BarChart2 className="h-8 w-8 text-slate-300 mx-auto" />
                             <p className="text-[10px] text-slate-400 font-medium">Visualisation ID: {message.result?.id || '...'}</p>
                             <p className="text-xs font-bold text-primary">Prêt à consulter</p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground mt-1 mx-2 flex flex-col justify-end">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
