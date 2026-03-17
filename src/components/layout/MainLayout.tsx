import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '@/components/ui/toaster';
import { QuickActions } from '@/components/shared/QuickActions';
import { ChatbotAssistant } from '@/components/chatbot/ChatbotAssistant';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={`transition-all duration-300 w-full min-w-0 ${sidebarCollapsed ? 'lg:pl-[70px]' : 'lg:pl-[260px]'
          }`}
      >
        <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="w-full">
          {children}
        </main>
        <div className="fixed bottom-0 left-0 right-0">
          <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[70px]' : 'lg:pl-[260px]'}`}>
            <QuickActions />
          </div>
        </div>
      </div>
      <ChatbotAssistant />
      <Toaster />
    </div>
  );
}
