import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/components/shared/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Wallet,
  Users,
  Truck,
  Package,
  FileText,
  ShieldAlert,
  BrainCircuit,
  Settings2,
  ChevronDown,
  Calendar,
  Target,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { AlertsPopover } from '@/components/shared/AlertsPopover';
import { useLocation } from 'react-router-dom';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useFilters } from '@/context/FilterContext';
import { useQueryClient } from '@tanstack/react-query';

const ROUTE_CONFIG: Record<string, { label: string, icon: any }> = {
  '/dashboard': { label: 'Tableau de bord', icon: LayoutDashboard },
  '/finance': { label: 'Finance & Trésorerie', icon: Wallet },
  '/sales': { label: 'Ventes', icon: Users },
  '/purchases': { label: 'Achats & Performance', icon: Truck },
  '/stocks': { label: 'Stocks & Articles', icon: Package },
  '/accounting': { label: 'Comptabilité', icon: FileText },
  '/risks': { label: 'Risques & Recouvrement', icon: ShieldAlert },
  '/smart-queries': { label: 'Requêtes Intelligentes', icon: BrainCircuit },
  '/settings': { label: 'Paramètres', icon: Settings2 },
  '/profile': { label: 'Profil', icon: UserIcon },
  '/targets': { label: 'Objectifs & Cibles', icon: Target },
  '/targets/:id': { label: 'Détail objectif', icon: Target },
};

interface HeaderProps {
  onMenuToggle: () => void;
}

const PERIOD_LABELS: Record<string, string> = {
  current_month: 'Ce mois',
  current_quarter: 'Ce trimestre',
  current_year: 'Cette année',
  custom: 'Personnalisé',
};

const CURRENCY_LABELS: Record<string, string> = {
  XOF: 'FCFA',
  EUR: '€',
  USD: '$',
};

export function Header({ onMenuToggle }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { period, setPeriod, currency, setCurrency } = useFilters();
  const queryClient = useQueryClient();

  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const getDetailLabel = (parentKey: string, itemId: string): string => {
    if (parentKey === '/targets') {
      const target = queryClient.getQueryData<any>(['targets', itemId]);
      const kpis = queryClient.getQueryData<any[]>(['kpi-definitions']);
      if (target) {
        const kpiName = kpis?.find((k) => k.key === target.kpiKey)?.name;
        return kpiName ?? target.label ?? target.kpiKey ?? 'Détail';
      }
    }
    return 'Détail';
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-4 z-30 h-16 mx-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-lg shadow-slate-200/40 dark:shadow-none transition-all">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side - Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          data-testid="mobile-menu-btn"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Global Breadcrumbs - Desktop only */}
        <div className="hidden lg:flex items-center ml-4">
          {(() => {
            const exact = ROUTE_CONFIG[location.pathname];
            if (exact) return <Breadcrumbs currentPage={exact.label} PageIcon={exact.icon} />;
            const parentKey = "/" + location.pathname.split("/").filter(Boolean)[0];
            const parent = parentKey ? ROUTE_CONFIG[parentKey] : null;
            const itemId = location.pathname.split('/').filter(Boolean)[1] ?? '';
            if (parent) return <Breadcrumbs currentPage={getDetailLabel(parentKey, itemId)} PageIcon={parent.icon} parent={{ label: parent.label, path: parentKey }} />;
            return null;
          })()}
        </div>

        {/* Global Filters — Period + Currency */}
        <div className="hidden lg:flex items-center gap-2 ml-auto mr-2">
          {period === 'custom' && (
            <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-2">
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none"
              />
              <span className="text-[10px] text-slate-400 font-bold">→</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {PERIOD_LABELS[period] ?? 'Période'}
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => setPeriod('current_month')}>Ce mois</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod('current_quarter')}>Ce trimestre</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod('current_year')}>Cette année</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPeriod('custom')}>Plage personnalisée</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="text-primary font-black">{CURRENCY_LABELS[currency] ?? currency}</span>
                <span className="text-slate-400">{currency}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[100px]">
              <DropdownMenuItem onClick={() => setCurrency('XOF')}>XOF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency('EUR')}>EUR</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency('USD')}>USD</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle — hidden */}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="theme-toggle"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Alerts */}
          <AlertsPopover />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
                data-testid="user-menu-btn"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate('/profile')}
                data-testid="profile-menu-item"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
                data-testid="logout-menu-item"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('auth.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
