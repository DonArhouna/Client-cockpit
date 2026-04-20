import { useState, useEffect } from 'react';
import { LayoutItem, Layout } from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Widget } from '@/types';
import { WidgetCard } from './WidgetCard';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
    pageId: string;
    widgets: Widget[];
    isEditing: boolean;
    onLayoutChangeAction?: (layouts: { [widgetId: string]: { x: number, y: number, w: number, h: number } }) => void;
    onRemoveWidget: (id: string) => void;
}

export function DashboardGrid({ pageId, widgets, isEditing, onLayoutChangeAction, onRemoveWidget }: DashboardGridProps) {

    // Transform widgets array to react-grid-layout expected format
    const generateLayout = (widgets: Widget[]): LayoutItem[] => {
        return widgets.map((widget) => ({
            i: widget.id,
            x: widget.position?.x ?? 0,
            y: widget.position?.y ?? 0,
            w: widget.position?.w ?? 4, // Largeur par défaut
            h: widget.position?.h ?? 3, // Hauteur par défaut
            minW: 1,
            minH: 1,
        }));
    };

    const [currentLayout, setCurrentLayout] = useState<LayoutItem[]>(generateLayout(widgets));

    // Update layout when widgets prop changes (e.g., from network response or new widget added)
    useEffect(() => {
        setCurrentLayout(generateLayout(widgets));
    }, [widgets]);

    const onLayoutChange = (layout: Layout) => {
        // react-grid-layout gère son propre état interne pendant le drag.
        // Mettre à jour l'état React ici provoque des lags et des sauts (jitters).
        // On ne fait rien ici, on attend onDragStop ou onResizeStop pour persister.
    };

    const onDragStop = (layout: Layout) => {
        const newLayout = [...layout];
        setCurrentLayout(newLayout);
        if (onLayoutChangeAction) {
            const layoutUpdates: { [widgetId: string]: { x: number, y: number, w: number, h: number } } = {};
            layout.forEach((l) => {
                layoutUpdates[l.i] = { x: l.x, y: l.y, w: l.w, h: l.h };
            });
            onLayoutChangeAction(layoutUpdates);
        }
    };

    const onResizeStop = (layout: Layout) => {
        const newLayout = [...layout];
        setCurrentLayout(newLayout);
        if (onLayoutChangeAction) {
            const layoutUpdates: { [widgetId: string]: { x: number, y: number, w: number, h: number } } = {};
            layout.forEach((l) => {
                layoutUpdates[l.i] = { x: l.x, y: l.y, w: l.w, h: l.h };
            });
            onLayoutChangeAction(layoutUpdates);
        }
    };

    if (!widgets || widgets.length === 0) {
        if (!isEditing) {
            return null;
        }
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">Aucun widget configuré</h3>
                <p className="text-slate-500 dark:text-slate-500 max-w-sm">
                    Ajoutez des widgets depuis le panneau latéral pour commencer.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full relative px-2">
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: currentLayout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }}
                rowHeight={100}
                onLayoutChange={onLayoutChange}
                onDragStop={onDragStop}
                onResizeStop={onResizeStop}
                isDraggable={isEditing}
                isResizable={isEditing}
                draggableHandle=".drag-handle"
                margin={[20, 20]}
                compactType="vertical"
                useCSSTransforms={true}
                measureBeforeMount={false}
                transformScale={1}
            >
                {widgets.map((widget) => (
                    <div key={widget.id} className="h-full group">
                        <WidgetCard
                            pageId={pageId}
                            widget={widget}
                            isEditing={isEditing}
                            onRemove={onRemoveWidget}
                        />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
}
