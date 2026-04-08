import { Download, Settings, Share2, FileSpreadsheet, FileText, Presentation, Bug, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCsv, exportToExcel, exportToPptx } from '@/lib/export';
import { BugReportModal } from '@/features/support/components/BugReportModal';
import * as React from 'react';

interface QuickActionsProps {
  isChatOpen: boolean;
  onChatToggle: () => void;
}

export function QuickActions({ isChatOpen, onChatToggle }: QuickActionsProps) {
  const { toggleEditMode } = useDashboardEdit();
  const [bugModalOpen, setBugModalOpen] = React.useState(false);

  return (
    <div className="max-w-fit mx-auto mb-6 px-1 py-1.5 bg-[#3b66ac] dark:bg-slate-800/95 backdrop-blur-xl border border-white/10 dark:border-slate-700/50 rounded-2xl shadow-2xl shadow-blue-500/30 dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-1.5 px-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:bg-white/10 dark:text-slate-400 dark:hover:bg-slate-800 h-9 px-3 rounded-xl transition-all hover:scale-105 active:scale-95">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exporter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => exportToCsv('cockpit-export', [])}>
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span>Exporter en CSV (.csv)</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => exportToExcel('cockpit-export', [])}>
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Exporter en Excel (.xlsx)</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => exportToPptx('cockpit-export', [])}>
                  <Presentation className="h-4 w-4 text-orange-600" />
                  <span>Exporter en PowerPoint (.pptx)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-white/90 hover:bg-white/10 dark:text-slate-400 dark:hover:bg-slate-800 h-9 px-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                onClick={toggleEditMode}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Personnaliser</span>
            </Button>
            
            <div className="h-6 w-[1px] bg-white/20 dark:bg-slate-600 mx-1" />

            <BugReportModal open={bugModalOpen} onOpenChange={setBugModalOpen}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-white/90 hover:bg-white/10 dark:text-slate-400 dark:hover:bg-slate-800 h-9 px-3 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <Bug className="h-4 w-4 text-red-300 dark:text-red-400" />
                <span className="hidden sm:inline">Signaler un bug</span>
              </Button>
            </BugReportModal>

            <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:bg-white/10 dark:text-slate-400 dark:hover:bg-slate-800 h-9 px-3 rounded-xl transition-all hover:scale-105 active:scale-95">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Partager</span>
            </Button>

            <div className="h-6 w-[1px] bg-white/20 dark:bg-slate-600 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 h-9 px-3 rounded-xl transition-all hover:scale-105 active:scale-95 ${isChatOpen ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10 dark:text-slate-400 dark:hover:bg-slate-800'}`}
              onClick={onChatToggle}
              title="Assistant Zuri"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Zuri</span>
            </Button>
      </div>
    </div>
  );
}
