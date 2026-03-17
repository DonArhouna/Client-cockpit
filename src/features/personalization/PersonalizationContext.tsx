import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Widget } from '@/types';
import { dashboardsApi, kpiDefinitionsApi } from '@/api';
import { PAGE_DEFAULT_WIDGETS } from './DefaultLayouts';

/**
 * Interface pour le contexte de personnalisation.
 * Gère les agencements (layouts) de widgets pour différentes pages.
 */
interface PersonalizationContextType {
    layouts: Record<string, Widget[]>;
    addWidgetToPage: (pageId: string, widgetData: Partial<Omit<Widget, 'id' | 'dashboardId'>> & { name: string, type: string }) => void;
    setPageLayout: (pageId: string, widgets: Widget[]) => void;
    removeWidgetFromPage: (pageId: string, widgetId: string) => void;
    updateLayoutForPage: (pageId: string, layoutUpdates: Record<string, { x: number, y: number, w: number, h: number }>) => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

const STORAGE_KEY = 'cockpit_personalized_layouts';

/** Convertit un widget DB (champ `exposure`) en widget local (champ `kpiKey`). */
const dbToLocal = (w: any): Widget => ({
    ...w,
    kpiKey: w.exposure ?? (w.config?.kpiKey as string | undefined),
    position: w.position ?? { x: 0, y: 0, w: 4, h: 3 },
});

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // État local initialisé depuis le localStorage (cache offline)
    const [layouts, setLayouts] = useState<Record<string, Widget[]>>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
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

    // Persistance automatique dans le localStorage à chaque changement (cache offline)
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    }, [layouts]);

    /**
     * Au montage : charge tous les dashboards depuis l'API.
     * L'API prend le dessus sur le localStorage pour les pages qui ont des données en base.
     * Fallback silencieux sur localStorage si l'API est inaccessible (offline, non connecté).
     */
    useEffect(() => {
        (async () => {
            if (!localStorage.getItem('accessToken')) return;
            try {
                const resp = await dashboardsApi.getAll();
                const dashboards: any[] = resp.data;

                const ids: Record<string, string> = {};
                const fromApi: Record<string, Widget[]> = {};

                for (const db of dashboards) {
                    ids[db.name] = db.id;
                    const widgets: any[] = db.widgets ?? [];
                    if (widgets.length > 0) {
                        fromApi[db.name] = widgets.map(dbToLocal);
                    }
                }

                dashboardIds.current = ids;
                apiReady.current = true;

                // L'API gagne sur le localStorage pour toute page ayant des widgets en base
                if (Object.keys(fromApi).length > 0) {
                    setLayouts(prev => ({ ...prev, ...fromApi }));
                }

                // Sync initiale : pages qui ont des widgets en localStorage mais rien en DB
                // (cas des widgets créés avant l'activation de la sync API)
                const localLayouts = (() => {
                    const saved = localStorage.getItem('cockpit_personalized_layouts');
                    if (saved) { try { return JSON.parse(saved) as Record<string, Widget[]>; } catch {} }
                    return {} as Record<string, Widget[]>;
                })();

                for (const [pageId, localWidgets] of Object.entries(localLayouts)) {
                    // Sauter si l'API a déjà des widgets pour cette page, ou si le localStorage est vide
                    if (fromApi[pageId] || !localWidgets.length) continue;
                    // Sauter les widgets déjà en DB (id ne commence pas par 'local-')
                    const unsynced = localWidgets.filter(w => w.id.startsWith('local-') || !w.dashboardId || w.dashboardId === 'local-personalization');
                    if (!unsynced.length) continue;

                    // Créer le dashboard et pousser les widgets
                    (async () => {
                        const dashboardId = await (async () => {
                            if (ids[pageId]) return ids[pageId];
                            try {
                                const r = await dashboardsApi.create({ name: pageId, isDefault: pageId === 'dashboard' });
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
                // Population automatique des layouts par défaut pour les pages vides
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
                            // Si la page n'a pas de widgets (ni API, ni local)
                            if (!fromApi[pageId] && (!localLayouts[pageId] || localLayouts[pageId].length === 0)) {
                                const defaultGenerator = PAGE_DEFAULT_WIDGETS[pageId];
                                if (defaultGenerator) {
                                    const defaultWidgets = defaultGenerator(allKpis).map(dw => ({
                                        ...dw,
                                        id: `local-def-${pageId}-${Math.random().toString(36).substr(2, 9)}`,
                                        isActive: true,
                                        userId: 'default',
                                        organizationId: 'default',
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                        dashboardId: 'local-personalization',
                                    } as Widget));
                                    
                                    // Utiliser setPageLayout pour synchroniser avec la DB en arrière-plan
                                    setPageLayout(pageId, defaultWidgets);
                                }
                            }
                        }
                    } catch (e) {
                        console.error("Failed to populate default layouts", e);
                    }
                }
            } catch {
                // API indisponible ou non connecté → conserver le localStorage
            }
        })();
    }, []);

    /**
     * Récupère l'id du dashboard DB pour une page.
     * Le crée s'il n'existe pas encore.
     */
    const getOrCreateDashboard = async (pageId: string): Promise<string | null> => {
        if (dashboardIds.current[pageId]) return dashboardIds.current[pageId];
        try {
            const resp = await dashboardsApi.create({
                name: pageId,
                isDefault: pageId === 'dashboard',
            });
            dashboardIds.current = { ...dashboardIds.current, [pageId]: resp.data.id };
            return resp.data.id;
        } catch {
            return null;
        }
    };

    /**
     * Ajoute un widget à une page.
     * Mise à jour locale immédiate (optimiste) + sync API en arrière-plan.
     * L'id temporaire local est remplacé par l'id DB une fois le widget créé.
     */
    const addWidgetToPage = (
        pageId: string,
        widgetData: Partial<Omit<Widget, 'id' | 'dashboardId'>> & { name: string; type: string },
    ) => {
        const tempId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const pageWidgets = (layouts[pageId] || []).filter(w => w.isActive);
        const w = widgetData.position?.w || 4;
        const h = widgetData.position?.h || 3;
        
        // Find bottom position (maxY)
        const maxY = pageWidgets.length > 0 
            ? Math.max(...pageWidgets.map(widget => (widget.position?.y || 0) + (widget.position?.h || 0)))
            : 0;

        let foundX = 0;
        let foundY = maxY;
        
        if (w < 12) {
            // Try to find a spot on the current last row if there's space
            const COLS = 12;
            
            // Check if there's space on the row before just appending at the very bottom
            // Actually, to be safe and follow the request "always at the bottom", 
            // we check if we can fit it at foundY without overlap, or increment foundY.
            
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
                
                if (foundY > maxY + 50) break; // Safety
            }
        }

        const newWidget: Widget = {
            config: {}, // Default config
            isActive: true,
            userId: 'local-user',
            organizationId: 'local-org',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...widgetData, // Overwrite defaults with provided widgetData
            id: tempId, // Use the generated tempId
            dashboardId: 'local-personalization',
            position: { x: foundX, y: foundY, w, h }, // Calculated position
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
                        position: newWidget.position || { x: 0, y: 100, w: 4, h: 3 },
                    });
                    // Remplace l'id temporaire par l'id DB
                    setLayouts(prev => ({
                        ...prev,
                        [pageId]: (prev[pageId] || []).map(w =>
                            w.id === tempId ? { ...w, id: resp.data.id, dashboardId } : w
                        ),
                    }));
                } catch { /* Garde l'id temporaire si l'API échoue */ }
            })();
        }
    };

    /**
     * Remplace entièrement les widgets d'une page (utilisé pour l'auto-population initiale).
     * Mise à jour locale immédiate + sync API séquentielle en arrière-plan.
     * Chaque id temporaire est remplacé par son id DB une fois créé.
     */
    const setPageLayout = (pageId: string, widgets: Widget[]) => {
        setLayouts(prev => ({ ...prev, [pageId]: widgets }));

        if (apiReady.current) {
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
                            position: w.position || { x: 0, y: 0, w: 4, h: 3 },
                        });
                        synced.push({ ...w, id: resp.data.id, dashboardId });
                    } catch {
                        synced.push(w); // Garde l'id local si la création échoue
                    }
                }
                setLayouts(prev => ({ ...prev, [pageId]: synced }));
            })();
        }
    };

    /**
     * Supprime un widget d'une page.
     * Mise à jour locale immédiate + suppression DB en arrière-plan.
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
     * Met à jour les positions des widgets (drag & drop).
     * Mise à jour locale immédiate + PATCH DB en arrière-plan pour chaque widget déplacé.
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

/**
 * Hook personnalisé pour accéder aux fonctions de personnalisation.
 */
export const usePersonalization = () => {
    const context = useContext(PersonalizationContext);
    if (context === undefined) {
        throw new Error('usePersonalization doit être utilisé à l\'intérieur d\'un PersonalizationProvider');
    }
    return context;
};
