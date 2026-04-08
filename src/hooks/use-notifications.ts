import { useMemo } from 'react';
import { useAgents } from '@/hooks/use-api';
import { Agent } from '@/types';

export interface RealNotification {
    id: string;
    title: string;
    category: string;
    description: string;
    date: string;
    status: 'critical' | 'warning' | 'info';
    isRead: boolean;
    type: 'agent' | 'target' | 'system';
}

export function useRealNotifications() {
    const { data: agents, isLoading: isLoadingAgents } = useAgents();

    const notifications = useMemo(() => {
        const alerts: RealNotification[] = [];

        // 1. Agent Alerts
        if (agents) {
            agents.forEach((agent: Agent) => {
                if (agent.status === 'error') {
                    alerts.push({
                        id: `agent-err-${agent.id}`,
                        title: `Erreur Agent: ${agent.name}`,
                        category: 'Système',
                        description: `L'agent Sage rencontre des erreurs critiques (${agent.errorCount} erreurs détectées).`,
                        date: agent.lastSeen || new Date().toISOString(),
                        status: 'critical',
                        isRead: false,
                        type: 'agent'
                    });
                } else if (agent.status === 'offline') {
                    alerts.push({
                        id: `agent-off-${agent.id}`,
                        title: `Agent Hors Ligne: ${agent.name}`,
                        category: 'Système',
                        description: `L'agent Sage est déconnecté. Dernière activité: ${agent.lastSeen || 'inconnue'}.`,
                        date: agent.lastSeen || new Date().toISOString(),
                        status: 'warning',
                        isRead: false,
                        type: 'agent'
                    });
                }
            });
        }

        // 2. Fallback to some logic-based "Real" mocks if no agents (for demo)
        // In a real app, this would come from a /notifications endpoint
        if (alerts.length === 0 && !isLoadingAgents) {
            // If everything is fine, we can still show some system info or keep it empty
            // For now, let's keep it empty to be "real"
        }

        return alerts;
    }, [agents, isLoadingAgents]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return {
        notifications,
        unreadCount,
        isLoading: isLoadingAgents
    };
}
