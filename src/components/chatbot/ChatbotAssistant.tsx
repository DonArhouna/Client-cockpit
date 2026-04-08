import { ChatWindow } from './ChatWindow';
import { useDashboardEdit } from '@/context/DashboardEditContext';

interface ChatbotAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatbotAssistant({ isOpen, onClose }: ChatbotAssistantProps) {
  const { isSidebarOpen } = useDashboardEdit();

  if (isSidebarOpen || !isOpen) return null;

  return <ChatWindow onClose={onClose} />;
}
