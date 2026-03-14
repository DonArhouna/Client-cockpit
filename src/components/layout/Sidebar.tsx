import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Users,
  Truck,
  Package,
  FileText,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Settings2,
  ShieldAlert,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDashboardEdit } from '@/context/DashboardEditContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.exclusiveDashboard' },
  { path: '/finance', icon: Wallet, labelKey: 'nav.cashFlowTracking' },
  { path: '/sales', icon: Users, labelKey: 'nav.revenueAnalysis' },
  { path: '/purchases', icon: Truck, labelKey: 'nav.operationalPerformance' },
  { path: '/stocks', icon: Package, labelKey: 'nav.stockAndArticles' },
  { path: '/accounting', icon: FileText, labelKey: 'nav.accountingAnalytic' },
  { path: '/risks', icon: ShieldAlert, labelKey: 'nav.risksAndRecovery' },
  { path: '/smart-queries', icon: BrainCircuit, labelKey: 'nav.smartQueries' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { isEditing, toggleEditMode } = useDashboardEdit();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity',
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={onToggle}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
          collapsed ? 'w-[70px]' : 'w-[260px]',
          collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        )}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className="flex items-center h-20 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden w-full">
            <img
              src="/Logo-cockpit.jpeg"
              alt="Cockpit Logo"
              className={cn(
                "object-contain rounded transition-all duration-300",
                collapsed ? "h-8 w-8" : "h-10 w-auto"
              )}
            />
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-lg text-sidebar-foreground truncate tracking-tight">Cockpit</h1>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider truncate opacity-80">Client</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      'hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground'
                    )}
                    data-testid={`nav-${item.path.slice(1)}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                       <span className="truncate">{t(item.labelKey)}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Area with Settings and Personalization */}
        <div className="mt-auto flex flex-col gap-2">
          {/* Settings Section */}
          <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                location.pathname === '/settings'
                  ? "bg-[#3b66ac] text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
              )}
            >
              <Settings2 className={cn("h-5 w-5 shrink-0 group-hover:rotate-45 transition-transform")} />
              {!collapsed && <span>{t('nav.settings') || 'Paramètres'}</span>}
            </Link>
          </div>

          {/* Personalization Section */}
          <div className="px-4 pb-4">
            <div
              onClick={(e) => {
                e.preventDefault();
                toggleEditMode();
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border border-primary/20 hover:border-primary/50 group cursor-pointer shadow-sm',
                isEditing ? 'bg-[#3b66ac] text-white border-none shadow-blue-500/20' : 'text-slate-600 bg-slate-50 hover:bg-slate-100 dark:text-slate-300 dark:bg-slate-800/40 dark:hover:bg-slate-800/60'
              )}
            >
              <Palette className={cn("h-5 w-5 shrink-0 transition-transform", isEditing ? "animate-pulse" : "group-hover:scale-110")} />
              {!collapsed && (
                <span className="truncate">Personnaliser</span>
              )}
            </div>
          </div>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Collapse button */}
        <div className="p-3 hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full justify-center text-muted-foreground hover:text-foreground',
              !collapsed && 'justify-start'
            )}
            data-testid="sidebar-toggle"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>{t('common.collapse') || 'Réduire'}</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
