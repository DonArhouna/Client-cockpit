import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Widget } from '@/types';
import { dashboardsApi, kpiDefinitionsApi } from '@/api';
import { useAuth } from '@/features/auth/AuthContext';
import { PAGE_DEFAULT_WIDGETS } from './DefaultLayouts';

/**
 * Interface pour le contexte de personnalisation.
 * Gère les agencements (layouts) de widgets de manière isolée par utilisateur.
 */
interface PersonalizationContextType {
    layouts: Record<string, Widget[]>;
    addWidgetToPage: (pageId: string, widgetData: Partial<Omit<Widget, 'id' | 'dashboardId'>> & { name: string, type: string }) => void;
    setPageLayout: (pageId: string, widgets: Widget[]) => void;
    removeWidgetFromPage: (pageId: string, widgetId: string) => void;
    updateLayoutForPage: (pageId: string, layoutUpdates: Record<string, { x: number, y: number, w: number, h: number }>) => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

/** Convertit un widget DB (champ `exposure`) en widget local (champ `kpiKey`). */
const dbToLocal = (w: any): Widget => ({
    ...w,
    kpiKey: w.exposure ?? (w.config?.kpiKey as string | undefined),
    position: w.position ?? { x: 0, y: 0, w: 4, h: 3 },
});

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    
    // Clé de stockage unique par utilisateur pour éviter les conflits sur PC partagé
    const getStorageKey = () => user ? `cockpit_layouts_${user.id}` : 'cockpit_layouts_guest';

    // État local initialisé depuis le localStorage (cache spécifique à l'utilisateur)
    const [layouts, setLayouts] = useState<Record<string, Widget[]>>(() => {
        const saved = localStorage.getItem(getStorageKey());
        if (saved) {
            try { return JSON.parse(saved); } catch {}
        }
        return {
            dashboard: [], finance: [], revenue: [], purchases: [],
            stocks: [], accounting: [], risks: [], inventory: [],
            operational: [], 'smart-queries': [],
        };
    });

    // Correspondance pageId → id du dashboard en base
    const dashboardIds = useRef<Record<string, string>>({});
    // L'API est disponible et l'utilisateur est connecté
    const apiReady = useRef(false);

    // Persistance automatique dans le localStorage à chaque changement de layout
    useEffect(() => {
        if (user) {
            localStorage.setItem(getStorageKey(), JSON.stringify(layouts));
        }
    }, [layouts, user]);

    /**
     * Calcule le nom unique du dashboard pour l'API (Format: pageId-userId)
     * Cela garantit l'isolation même si le backend est partagé par l'organisation.
     */
    const getApiDashboardName = (pageId: string) => user ? `${pageId}-${user.id}` : pageId;

    /**
     * Au montage : charge tous les dashboards de l'utilisateur depuis l'API.
     */
    useEffect(() => {
        if (!user || !localStorage.getItem('accessToken')) return;

        (async () => {
            try {
                const resp = await dashboardsApi.getAll();
                const dashboards: any[] = resp.data;

                const ids: Record<string, string> = {};
                const fromApi: Record<string, Widget[]> = {};
                
                const userSuffix = `-${user.id}`;

                for (const db of dashboards) {
                    // On ne traite que les dashboards appartenant à l'utilisateur (nom se termine par -ID)
                    if (db.name.endsWith(userSuffix)) {
                        const pageId = db.name.replace(userSuffix, '');
                        ids[pageId] = db.id;
                        const widgets: any[] = db.widgets ?? [];
                        if (widgets.length > 0) {
                            fromApi[pageId] = widgets.map(dbToLocal);
                        }
                    }
                }

                dashboardIds.current = ids;
                apiReady.current = true;

                // L'API gagne sur le localStorage pour toute page ayant des widgets en base
                if (Object.keys(fromApi).length > 0) {
                    setLayouts(prev => ({ ...prev, ...fromApi }));
                }

                // Sync initiale : pages qui ont des widgets locaux mais rien en DB (nouveaux widgets)
                const currentStorageKey = getStorageKey();
                const localLayouts = (() => {
                    const saved = localStorage.getItem(currentStorageKey);
                    if (saved) { try { return JSON.parse(saved) as Record<string, Widget[]>; } catch {} }
                    return {} as Record<string, Widget[]>;
                })();

                for (const [pageId, localWidgets] of Object.entries(localLayouts)) {
                    if (fromApi[pageId] || !localWidgets.length) continue;
                    
                    const unsynced = localWidgets.filter(w => 
                        w.id.startsWith('local-') || !w.dashboardId || w.dashboardId === 'local-personalization'
                    );
                    if (!unsynced.length) continue;

                    (async () => {
                        const dashboardId = await (async () => {
                            if (ids[pageId]) return ids[pageId];
                            try {
                                const apiName = getApiDashboardName(pageId);
                                const r = await dashboardsApi.create({ 
                                    name: apiName, 
                                    isDefault: pageId === 'dashboard' 
                                });
                                dashboardIds.current = { ...dashboardIds.current, [pageId]: r.data.id };
                                return r.data.id;
                            } catch { return null; }
                        })();
                        
                        if (!dashboardId) return;

                        const synced: Widget[] = [];
                        for (const w of unsynced) {
                            try {
                                const r = await dashboardsApi.addWidget(dashboardId, {
                                    name: w.name,
                                    type: w.type,
                                    exposure: w.kpiKey ?? undefined,
                                    vizType: w.vizType ?? undefined,
                                    config: { ...(w.config || {}), kpiKey: w.kpiKey },
                                    position: w.position || { x: 0, y: 0, w: 4, h: 3 },
                                });
                                synced.push({ ...w, id: r.data.id, dashboardId });
                            } catch {
                                synced.push(w);
                            }
                        }
                        if (synced.some((w, i) => w.id !== unsynced[i]?.id)) {
                            setLayouts(prev => ({ ...prev, [pageId]: synced }));
                        }
                    })();
                }

                // Population automatique des layouts par défaut pour les pages totalement vides
                if (apiReady.current) {
                    try {
                        const kpisResp = await kpiDefinitionsApi.getAll();
                        const allKpis = kpisResp.data;

                        const pages = [
                            'dashboard', 'finance', 'revenue', 'purchases', 
                            'stocks', 'accounting', 'risks', 'inventory', 
                            'operational'
                        ];

                        for (const pageId of pages) {
                            if (!fromApi[pageId] && (!localLayouts[pageId] || localLayouts[pageId].length === 0)) {
                                const defaultGenerator = PAGE_DEFAULT_WIDGETS[pageId];
                                if (defaultGenerator) {
                                    const defaultWidgets = defaultGenerator(allKpis).map(dw => ({
                                        ...dw,
                                        id: `local-def-${pageId}-${Math.random().toString(36).substr(2, 9)}`,
                                        isActive: true,
                                        userId: user.id,
                                        organizationId: user.organizationId || 'default',
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                        dashboardId: 'local-personalization',
                                    } as Widget));
                                    
                                    setPageLayout(pageId, defaultWidgets);
                                }
                            }
                        }
                    } catch (e) {
                        console.error("Failed to populate default layouts", e);
                    }
                }
            } catch (e) {
                console.error("Personalization load failure", e);
            }
        })();
    }, [user]);

    /**
     * Récupère ou crée l'id du dashboard DB (isolé par utilisateur).
     */
    const getOrCreateDashboard = async (pageId: string): Promise<string | null> => {
        if (!user) return null;
        if (dashboardIds.current[pageId]) return dashboardIds.current[pageId];
        
        try {
            const apiName = getApiDashboardName(pageId);
            const resp = await dashboardsApi.create({
                name: apiName,
                isDefault: pageId === 'dashboard',
            });
            dashboardIds.current = { ...dashboardIds.current, [pageId]: resp.data.id };
            return resp.data.id;
        } catch {
            return null;
        }
    };

    /**
     * Ajoute un widget à une page. Isolation par utilisateur active.
     */
    const addWidgetToPage = (
        pageId: string,
        widgetData: Partial<Omit<Widget, 'id' | 'dashboardId'>> & { name: string; type: string },
    ) => {
        if (!user) return;
        
        const tempId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const pageWidgets = (layouts[pageId] || []).filter(w => w.isActive);
        const w = widgetData.position?.w || 4;
        const h = widgetData.position?.h || 3;
        
        const maxY = pageWidgets.length > 0 
            ? Math.max(...pageWidgets.map(widget => (widget.position?.y || 0) + (widget.position?.h || 0)))
            : 0;

        // On place le nouveau widget dans une zone garantie vide en bas
        // Utiliser maxY garantit qu'il n'y a pas de collision initiale
        let foundX = 0;
        let foundY = maxY;
        const COLS = 12;

        // Petite boucle de sécurité pour trouver la première colonne libre à partir de maxY
        // Même si maxY est le bas, certains widgets asymétriques pourraient dépasser
        let isOccupied = true;
        while (isOccupied) {
            isOccupied = pageWidgets.some(widget => {
                const wp = widget.position;
                if (!wp) return false;
                return (
                    foundX < wp.x + wp.w &&
                    foundX + w > wp.x &&
                    foundY < wp.y + wp.h &&
                    foundY + h > wp.y
                );
            });
            
            if (isOccupied) {
                foundX += 1;
                if (foundX + w > COLS) {
                    foundX = 0;
                    foundY += 1;
                }
            }
        }

        const newWidget: Widget = {
            config: {},
            isActive: true,
            userId: user.id,
            organizationId: user.organizationId || 'local-org',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...widgetData,
            id: tempId,
            dashboardId: 'local-personalization',
            position: { x: foundX, y: foundY, w, h },
        };

        setLayouts(prev => ({ ...prev, [pageId]: [...(prev[pageId] || []), newWidget] }));

        if (apiReady.current) {
            (async () => {
                const dashboardId = await getOrCreateDashboard(pageId);
                if (!dashboardId) return;
                try {
                    const resp = await dashboardsApi.addWidget(dashboardId, {
                        name: newWidget.name || 'Widget sans nom',
                        type: newWidget.type || 'kpi',
                        exposure: newWidget.kpiKey || undefined,
                        vizType: newWidget.vizType || undefined,
                        config: { ...(newWidget.config || {}), kpiKey: newWidget.kpiKey },
                        position: newWidget.position,
                    });
                    setLayouts(prev => ({
                        ...prev,
                        [pageId]: (prev[pageId] || []).map(w =>
                            w.id === tempId ? { ...w, id: resp.data.id, dashboardId } : w
                        ),
                    }));
                } catch {}
            })();
        }
    };

    /**
     * Remplace les widgets d'une page. Isolation par utilisateur active.
     */
    const setPageLayout = (pageId: string, widgets: Widget[]) => {
        setLayouts(prev => ({ ...prev, [pageId]: widgets }));

        if (apiReady.current && user) {
            (async () => {
                const dashboardId = await getOrCreateDashboard(pageId);
                if (!dashboardId) return;
                const synced: Widget[] = [];
                for (const w of widgets) {
                    try {
                        const resp = await dashboardsApi.addWidget(dashboardId, {
                            name: w.name || 'Widget sans nom',
                            type: w.type || 'kpi',
                            exposure: w.kpiKey || undefined,
                            vizType: w.vizType || undefined,
                            config: { ...(w.config || {}), kpiKey: w.kpiKey },
                            position: w.position,
                        });
                        synced.push({ ...w, id: resp.data.id, dashboardId });
                    } catch {
                        synced.push(w);
                    }
                }
                setLayouts(prev => ({ ...prev, [pageId]: synced }));
            })();
        }
    };

    /**
     * Supprime un widget. Isolation par utilisateur active.
     */
    const removeWidgetFromPage = (pageId: string, widgetId: string) => {
        setLayouts(prev => ({
            ...prev,
            [pageId]: (prev[pageId] || []).filter(w => w.id !== widgetId),
        }));

        if (apiReady.current && !widgetId.startsWith('local-')) {
            const dashboardId = dashboardIds.current[pageId];
            if (dashboardId) {
                dashboardsApi.removeWidget(dashboardId, widgetId).catch(() => {});
            }
        }
    };

    /**
     * Met à jour les positions. Isolation par utilisateur active.
     */
    const updateLayoutForPage = (
        pageId: string,
        layoutUpdates: Record<string, { x: number; y: number; w: number; h: number }>,
    ) => {
        setLayouts(prev => {
            const updated = (prev[pageId] || []).map(widget =>
                layoutUpdates[widget.id]
                    ? { ...widget, position: { ...widget.position, ...layoutUpdates[widget.id] } }
                    : widget
            );
            return { ...prev, [pageId]: updated };
        });

        if (apiReady.current) {
            const dashboardId = dashboardIds.current[pageId];
            if (!dashboardId) return;
            Object.entries(layoutUpdates).forEach(([widgetId, position]) => {
                if (!widgetId.startsWith('local-')) {
                    dashboardsApi.updateWidget(dashboardId, widgetId, { position }).catch(() => {});
                }
            });
        }
    };

    return (
        <PersonalizationContext.Provider value={{
            layouts,
            addWidgetToPage,
            setPageLayout,
            removeWidgetFromPage,
            updateLayoutForPage,
        }}>
            {children}
        </PersonalizationContext.Provider>
    );
};

export const usePersonalization = () => {
    const context = useContext(PersonalizationContext);
    if (context === undefined) {
        throw new Error('usePersonalization doit être utilisé à l\'intérieur d\'un PersonalizationProvider');
    }
    return context;
};
