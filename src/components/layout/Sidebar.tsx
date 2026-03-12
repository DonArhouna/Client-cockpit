import { NavLink, useLocation } from 'react-router-dom';
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
  Settings,
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
  { path: '/admin', icon: Settings, labelKey: 'nav.administration' },
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
        {/* Personnaliser button - Global Toggle */}
        <div className="p-3">
          <div
            onClick={(e) => {
              e.preventDefault();
              toggleEditMode();
            }}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 border border-primary/20 hover:border-primary/50 group cursor-pointer',
              isEditing ? 'bg-blue-600 text-white border-none shadow-md' : 'text-sidebar-foreground bg-transparent hover:bg-sidebar-accent'
            )}
          >
            <Settings2 className={cn("h-5 w-5 shrink-0 group-hover:rotate-45 transition-transform")} />
            {!collapsed && (
              <span className="truncate">Personnaliser</span>
            )}
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
