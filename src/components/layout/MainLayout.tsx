import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '@/components/ui/toaster';
import { QuickActions } from '@/components/shared/QuickActions';
import { ChatbotAssistant } from '@/components/chatbot/ChatbotAssistant';
import { useDashboardEdit } from '@/context/DashboardEditContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { navCollapsed: sidebarCollapsed, setNavCollapsed: setSidebarCollapsed } = useDashboardEdit();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={`transition-all duration-300 w-full min-w-0 flex flex-col ${sidebarCollapsed ? 'lg:pl-[108px]' : 'lg:pl-[296px]'
          }`}
      >
        <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main 
          key={location.pathname}
          className="w-full pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
        >
          {children}
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[108px]' : 'lg:pl-[296px]'}`}>
            <QuickActions />
          </div>
        </div>
      </div>
      <ChatbotAssistant />
      <Toaster />
    </div>
  );
}
