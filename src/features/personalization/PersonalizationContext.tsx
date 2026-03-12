import React, { createContext, useContext, useState, useEffect } from 'react';
import { Widget } from '@/types';

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

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // État des layouts, initialisé avec les données du localStorage si disponibles
    const [layouts, setLayouts] = useState<Record<string, Widget[]>>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Erreur lors de la lecture des layouts sauvegardés", e);
            }
        }
        return {
            'dashboard': [],
            'finance': [],
            'sales': [],
            'purchases': [],
            'stocks': [],
            'accounting': [],
            'smart-queries': []
        };
    });

    // Persistance automatique dans le localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    }, [layouts]);

    /**
     * Ajoute un nouveau widget à une page spécifique.
     * Génère un ID unique et définit une position par défaut.
     */
    const addWidgetToPage = (pageId: string, widgetData: Partial<Omit<Widget, 'id' | 'dashboardId'>> & { name: string, type: string }) => {
        const newWidget: Widget = {
            config: {},
            isActive: true,
            userId: 'local-user',
            organizationId: 'local-org',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            position: { x: 0, y: 0, w: 4, h: 3 },
            ...widgetData,
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            dashboardId: 'local-personalization',
        };

        setLayouts(prev => ({
            ...prev,
            [pageId]: [...(prev[pageId] || []), newWidget]
        }));
    };

    /**
     * Remplace entièrement les widgets d'une page (utile pour l'initialisation)
     */
    const setPageLayout = (pageId: string, widgets: Widget[]) => {
        setLayouts(prev => ({
            ...prev,
            [pageId]: widgets
        }));
    };

    /**
     * Supprime un widget d'une page.
     */
    const removeWidgetFromPage = (pageId: string, widgetId: string) => {
        setLayouts(prev => ({
            ...prev,
            [pageId]: (prev[pageId] || []).filter(w => w.id !== widgetId)
        }));
    };

    /**
     * Met à jour les positions et tailles des widgets pour une page (Drag & Drop).
     */
    const updateLayoutForPage = (pageId: string, layoutUpdates: Record<string, { x: number, y: number, w: number, h: number }>) => {
        setLayouts(prev => {
            const pageWidgets = prev[pageId] || [];
            const updatedWidgets = pageWidgets.map(widget => {
                if (layoutUpdates[widget.id]) {
                    return {
                        ...widget,
                        position: { ...widget.position, ...layoutUpdates[widget.id] }
                    };
                }
                return widget;
            });

            return {
                ...prev,
                [pageId]: updatedWidgets
            };
        });
    };

    return (
        <PersonalizationContext.Provider value={{
            layouts,
            addWidgetToPage,
            setPageLayout,
            removeWidgetFromPage,
            updateLayoutForPage
        }}>
            {children}
        </PersonalizationContext.Provider>
    );
};

/**
 * Hook personnalisé pour accéder facilement aux fonctions de personnalisation.
 */
export const usePersonalization = () => {
    const context = useContext(PersonalizationContext);
    if (context === undefined) {
        throw new Error('usePersonalization doit être utilisé à l\'intérieur d\'un PersonalizationProvider');
    }
    return context;
};
