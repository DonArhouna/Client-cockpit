import { Bell, Settings, ExternalLink } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useRealNotifications } from '@/hooks/use-notifications';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface Alert {
    id: string;
    title: string;
    category: string;
    description: string;
    date: string;
    status: 'critical' | 'warning' | 'info';
    isRead: boolean;
    type: 'agent' | 'target' | 'system';
}

export function AlertsPopover() {
    const { notifications: systemNotifications, unreadCount: systemUnreadCount, isLoading } = useRealNotifications();

    // Fallback alerts for demo if no system notifications exist
    const DEMO_ALERTS = [
        {
            id: 'demo-1',
            title: 'Trésorerie critique',
            category: 'Trésorerie',
            description: 'Le solde de trésorerie descendra sous le seuil critique de 500K € dans 7 jours',
            date: '2025-01-13 11:45',
            status: 'critical' as const,
            isRead: false,
            type: 'system' as const
        },
        {
            id: 'demo-2',
            title: 'DSO élevé - Energy Solutions Inc',
            category: 'Créances',
            description: 'Le DSO de ce client a atteint 68 jours, dépassant la limite de 45 jours',
            date: '2025-01-13 09:30',
            status: 'warning' as const,
            isRead: false,
            type: 'system' as const
        }
    ];

    // Combine real logic-based notifications with demo ones if needed
    const alerts = systemNotifications.length > 0 ? systemNotifications : DEMO_ALERTS;
    const unreadCount = systemNotifications.length > 0 ? systemUnreadCount : DEMO_ALERTS.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 rounded-full border border-background text-[10px] text-white flex items-center justify-center font-bold">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[600px] p-0 mr-4 shadow-xl" align="end">
                <div className="flex flex-col h-[500px]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                            <Bell className="h-4 w-4" />
                            <span>Alertes</span>
                            <Badge variant="destructive" className="ml-1 rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                                {unreadCount}
                            </Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>

                    <Tabs defaultValue="toutes" className="flex-1 flex flex-col">
                        <div className="px-4 pt-2 border-b">
                            <TabsList className="bg-transparent h-10 p-0 gap-2 overflow-x-auto no-scrollbar justify-start">
                                <TabsTrigger value="toutes" className="rounded-full data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground h-8 px-4 text-xs font-medium">
                                    Toutes ({alerts.length})
                                </TabsTrigger>
                                <TabsTrigger value="non-lues" className="rounded-full data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground h-8 px-4 text-xs font-medium">
                                    Non lues ({alerts.filter(a => !a.isRead).length})
                                </TabsTrigger>
                                <TabsTrigger value="agents" className="rounded-full data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground h-8 px-4 text-xs font-medium">
                                    Système ({alerts.filter(a => a.type === 'agent').length})
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <LoadingSpinner className="h-8 w-8 text-blue-600" />
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="toutes" className="m-0 border-none outline-none">
                                        {alerts.map((alert) => (
                                            <AlertItem key={alert.id} alert={alert} />
                                        ))}
                                    </TabsContent>
                                    <TabsContent value="non-lues" className="m-0 border-none outline-none">
                                        {alerts.filter(a => !a.isRead).map((alert) => (
                                            <AlertItem key={alert.id} alert={alert} />
                                        ))}
                                    </TabsContent>
                                    <TabsContent value="agents" className="m-0 border-none outline-none">
                                        {alerts.filter(a => a.type === 'agent').map((alert) => (
                                            <AlertItem key={alert.id} alert={alert} />
                                        ))}
                                    </TabsContent>
                                </>
                            )}
                        </div>
                    </Tabs>

                    {/* Footer */}
                    <div className="p-3 border-t bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{alerts.length} alerte(s) affichée(s)</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-500 hover:text-blue-400 font-semibold uppercase tracking-wider">
                            ... Voir tout
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function AlertItem({ alert }: { alert: Alert }) {
    const statusColor = {
        critical: 'text-red-500 bg-red-500/10',
        warning: 'text-amber-500 bg-amber-500/10',
        info: 'text-blue-500 bg-blue-500/10',
    };

    const IconMap = {
        critical: '⚠️',
        warning: '⚠️',
        info: 'ℹ️',
    };

    return (
        <div className={cn(
            "p-4 border-b last:border-0 hover:bg-muted/50 transition-colors relative",
            !alert.isRead && "bg-accent/20"
        )}>
            <div className="flex gap-3">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-none", statusColor[alert.status])}>
                    <span className="text-sm">{IconMap[alert.status]}</span>
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{alert.title}</h4>
                        <Badge variant="outline" className="text-[10px] h-4 bg-muted text-muted-foreground border-none rounded-md">
                            {alert.category}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {alert.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground font-medium">{alert.date}</span>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                            <Clock className="h-3 w-3" />
                            Action requise
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-1">
                        <Button variant="ghost" size="sm" className="h-7 px-0 text-red-500 text-xs font-bold hover:bg-transparent">
                            Marquer comme lu
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-0 text-amber-500 text-xs font-bold hover:bg-transparent flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Agir
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Clock({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}