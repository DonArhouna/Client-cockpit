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
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDashboardEdit } from '@/context/DashboardEditContext';
import { useAuth } from '@/features/auth/AuthContext';
import { getInitials } from '@/lib/utils';

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
  { path: '/targets', icon: Target, labelKey: 'nav.targets' },
];

const customizableRoutes = [
  '/dashboard',
  '/finance',
  '/sales',
  '/purchases',
  '/stocks',
  '/accounting',
  '/risks',
  '/smart-queries'
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { isEditing, toggleEditMode } = useDashboardEdit();
  const { user } = useAuth();

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
          'fixed left-6 top-6 bottom-6 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col transition-all duration-300 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          collapsed ? '-translate-x-[calc(100%+1.5rem)] lg:translate-x-0' : 'translate-x-0'
        )}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 mb-4">
          <div className="flex items-center gap-3 overflow-hidden w-full px-2 pt-2">
            <img
              src="/Logo-cockpit.jpeg"
              alt="Cockpit Logo"
              className={cn(
                "object-contain transition-all duration-300",
                collapsed ? "h-9 w-9" : "h-12 w-auto"
              )}
            />
            {!collapsed && (
              <div className="overflow-hidden space-y-0.5">
                <h1 className="font-black text-xl text-slate-900 dark:text-white truncate tracking-tight leading-none">Cockpit</h1>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] truncate opacity-80">Client Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 overflow-y-auto pt-6 pb-4 no-scrollbar", collapsed ? "px-2" : "px-4")}>
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
                      collapsed && "justify-center px-0",
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground',
                      'hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                    data-testid={`nav-${item.path.slice(1)}`}
                  >
                    <Icon className="h-5 w-5 shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300" />
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
          <div className={cn("py-4 border-t border-slate-200 dark:border-slate-800", collapsed ? "px-2" : "px-4")}>
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                collapsed && "justify-center px-0",
                location.pathname === '/settings'
                  ? "bg-[#3b66ac] text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
              )}
            >
              <Settings2 className={cn("h-5 w-5 shrink-0 group-hover:rotate-45 transition-transform duration-300")} />
              {!collapsed && <span>{t('nav.settings') || 'Paramètres'}</span>}
            </Link>
          </div>

          {/* Personalization Section - Only show on customizable pages */}
          {customizableRoutes.includes(location.pathname) && (
            <div className={cn("pb-4", collapsed ? "px-2" : "px-4")}>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  toggleEditMode();
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border border-primary/20 hover:border-primary/50 group cursor-pointer shadow-sm',
                  collapsed && "justify-center px-0",
                  isEditing ? 'bg-[#3b66ac] text-white border-none shadow-blue-500/20' : 'text-slate-600 bg-slate-50 hover:bg-slate-100 dark:text-slate-300 dark:bg-slate-800/40 dark:hover:bg-slate-800/60'
                )}
              >
                <Palette className={cn("h-5 w-5 shrink-0 transition-all duration-300", isEditing ? "animate-pulse" : "group-hover:scale-110 group-hover:rotate-12")} />
                {!collapsed && (
                  <span className="truncate">Personnaliser</span>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* User info */}
        <Link
          to="/profile"
          className={cn(
            "px-3 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group",
            collapsed && "justify-center px-2",
            location.pathname === '/profile' && "bg-primary/5"
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <span className="text-[11px] font-black text-primary">
              {getInitials(user?.firstName, user?.lastName)}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight group-hover:text-primary transition-colors">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 truncate capitalize">
                {user?.userRoles?.[0]?.role?.name ?? 'Profil'}
              </p>
            </div>
          )}
        </Link>

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
