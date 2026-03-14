import { Download, Settings, Share2, FileSpreadsheet, FileText, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCsv, exportToExcel, exportToPptx } from '@/lib/export';

export function QuickActions() {
  const { toggleEditMode } = useDashboardEdit();

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Actions rapides</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Accès direct aux fonctionnalités principales</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exporter
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
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={toggleEditMode}
            >
              <Settings className="h-4 w-4" />
              Personnaliser
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Partager
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
