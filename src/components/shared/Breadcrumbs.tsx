import { Home, ChevronRight, LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
    currentPage: string;
    PageIcon: LucideIcon;
    parent?: { label: string; path: string };
    className?: string;
}

export function Breadcrumbs({ currentPage, PageIcon, parent, className }: BreadcrumbsProps) {
    return (
        <nav className={cn("flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium", className)}>
            <NavLink
                to="/dashboard"
                className="flex items-center gap-1.5 hover:text-primary dark:hover:text-primary cursor-pointer transition-colors"
            >
                <Home className="h-3.5 w-3.5" />
                <span>Accueil</span>
            </NavLink>

            {currentPage !== 'Tableau de bord' && (
                <>
                    <span className="opacity-50 mx-0.5 mt-0.5">
                        <ChevronRight className="h-3 w-3" />
                    </span>

                    {parent ? (
                        <>
                            <NavLink
                                to={parent.path}
                                className="flex items-center gap-1.5 hover:text-primary dark:hover:text-primary cursor-pointer transition-colors"
                            >
                                <PageIcon className="h-3.5 w-3.5 text-primary" />
                                <span>{parent.label}</span>
                            </NavLink>
                            <span className="opacity-50 mx-0.5 mt-0.5">
                                <ChevronRight className="h-3 w-3" />
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{currentPage}</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                            <PageIcon className="h-3.5 w-3.5 text-primary" />
                            <span className="font-bold">{currentPage}</span>
                        </div>
                    )}
                </>
            )}
        </nav>
    );
}
