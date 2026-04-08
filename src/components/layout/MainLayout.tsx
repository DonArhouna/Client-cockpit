import { useState } from 'react';
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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
          <div className="absolute bottom-4 right-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              title="Assistant Zuri"
              className={`w-14 h-14 rounded-full transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-blue-500/40 ${
                isChatOpen ? 'opacity-90 scale-95' : 'opacity-100'
              }`}
            >
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Fond cercle */}
                <circle cx="32" cy="32" r="32" fill="white" />
                <circle cx="32" cy="32" r="30" fill="#EEF3FB" />
                <circle cx="32" cy="32" r="30" stroke="#3b66ac" strokeWidth="2.5" fill="none" />

                {/* Casque - arceau */}
                <path d="M16 30 Q16 17 32 17 Q48 17 48 30" stroke="#3b66ac" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Oreillette gauche */}
                <rect x="12" y="29" width="7" height="10" rx="3.5" fill="#3b66ac" />
                {/* Oreillette droite */}
                <rect x="45" y="29" width="7" height="10" rx="3.5" fill="#3b66ac" />

                {/* Tête du robot */}
                <rect x="20" y="27" width="24" height="20" rx="6" fill="#3b66ac" />

                {/* Yeux */}
                <circle cx="26" cy="35" r="3" fill="white" />
                <circle cx="38" cy="35" r="3" fill="white" />
                <circle cx="27" cy="35" r="1.2" fill="#3b66ac" />
                <circle cx="39" cy="35" r="1.2" fill="#3b66ac" />

                {/* Bouche */}
                <path d="M27 42 Q32 45 37 42" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ChatbotAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <Toaster />
    </div>
  );
}
