import { useState, useEffect, useCallback } from 'react';
import { useNLQQuery, useJobStatus } from '@/hooks/use-api';

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'viz' | 'processing';
  status?: 'pending' | 'completed' | 'failed';
  jobId?: string;
  vizType?: string;
  result?: any;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const STORAGE_KEY = 'cockpit_chatbot_sessions';

export function useChatbot() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const nlqQuery = useNLQQuery();
  const { data: jobStatus } = useJobStatus(activeJobId, { 
    enabled: !!activeJobId,
    refetchInterval: 1500 
  });

  // Load sessions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse chatbot sessions", e);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const startNewSession = useCallback(() => {
    const newId = generateId();
    const newSession: ChatSession = {
      id: newId,
      title: "Nouvelle discussion",
      messages: [],
      updatedAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    return newId;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = startNewSession();
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      type: 'processing',
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          title: s.messages.length === 0 ? content.substring(0, 40) + (content.length > 40 ? '...' : '') : s.title,
          messages: [...s.messages, userMessage, assistantMessage],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));

    setIsProcessing(true);

    try {
      const result = await nlqQuery.mutateAsync(content);
      setActiveJobId(result.jobId);
      
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === assistantMessage.id ? { ...m, jobId: result.jobId } : m)
          };
        }
        return s;
      }));
    } catch (error) {
      console.error("NLQ Mutation Error:", error);
      setIsProcessing(false);
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === assistantMessage.id ? { ...m, status: 'failed', content: "Désolé, une erreur est survenue lors du traitement de votre demande." } : m)
          };
        }
        return s;
      }));
    }
  }, [currentSessionId, nlqQuery, startNewSession]);

  // Handle job status updates
  useEffect(() => {
    if (jobStatus?.status === 'COMPLETED' && activeJobId) {
      setSessions(prev => prev.map(s => {
        const assistantMessage = s.messages.find(m => m.jobId === activeJobId);
        if (assistantMessage) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === assistantMessage.id ? { 
              ...m, 
              status: 'completed', 
              type: 'viz',
              result: jobStatus.result,
              content: jobStatus.result?.message || "Voici le résultat de votre analyse."
            } : m)
          };
        }
        return s;
      }));
      setActiveJobId(null);
      setIsProcessing(false);
    } else if (jobStatus?.status === 'FAILED' && activeJobId) {
      setSessions(prev => prev.map(s => {
        const assistantMessage = s.messages.find(m => m.jobId === activeJobId);
        if (assistantMessage) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === assistantMessage.id ? { 
              ...m, 
              status: 'failed', 
              content: jobStatus.errorMessage || "Une erreur est survenue lors de l'exécution de la requête."
            } : m)
          };
        }
        return s;
      }));
      setActiveJobId(null);
      setIsProcessing(false);
    }
  }, [jobStatus, activeJobId]);

  return {
    sessions,
    currentSession,
    currentSessionId,
    setCurrentSessionId,
    startNewSession,
    sendMessage,
    isProcessing,
  };
}
