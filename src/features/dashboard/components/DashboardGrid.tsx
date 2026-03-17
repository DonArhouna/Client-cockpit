import { useState, useEffect } from 'react';
import { LayoutItem, Layout } from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Widget } from '@/types';
import { WidgetCard } from './WidgetCard';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
    widgets: Widget[];
    isEditing: boolean;
    onLayoutChangeAction?: (layouts: { [widgetId: string]: { x: number, y: number, w: number, h: number } }) => void;
    onRemoveWidget: (id: string) => void;
}

export function DashboardGrid({ widgets, isEditing, onLayoutChangeAction, onRemoveWidget }: DashboardGridProps) {

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
        setCurrentLayout([...layout]); // Clone to mutable array for state

        // Convert array format to dictionary to send back to parent
        if (onLayoutChangeAction) {
            const layoutUpdates: { [widgetId: string]: { x: number, y: number, w: number, h: number } } = {};
            let hasChanges = false;

            layout.forEach((l) => {
                const correspondingWidget = widgets.find(w => w.id === l.i);
                if (correspondingWidget) {
                    const pos = correspondingWidget.position;
                    // Check if position actually changed to avoid unnecessary API calls
                    if (!pos || pos.x !== l.x || pos.y !== l.y || pos.w !== l.w || pos.h !== l.h) {
                        layoutUpdates[l.i] = { x: l.x, y: l.y, w: l.w, h: l.h };
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges && !isEditing) {
                // Only trigger programmatic layout saves when NOT dragging (we'll capture drag stop later)
                // Wait, actually, react-grid-layout calls onLayoutChange on every mouse move while dragging
                // We probably only want to call API on drag/resize STOP.
            }
        }
    };

    const onDragStop = (layout: Layout) => {
        if (onLayoutChangeAction) {
            const layoutUpdates: { [widgetId: string]: { x: number, y: number, w: number, h: number } } = {};
            layout.forEach((l) => {
                layoutUpdates[l.i] = { x: l.x, y: l.y, w: l.w, h: l.h };
            });
            onLayoutChangeAction(layoutUpdates);
        }
    };

    const onResizeStop = (layout: Layout) => {
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
                margin={[20, 20]} // Improved spacing
                compactType="vertical"
                useCSSTransforms={true}
                measureBeforeMount={false}
            >
                {widgets.map((widget) => {
                    // Find the current layout for this widget to keep it synced
                    const l = currentLayout.find(item => item.i === widget.id);
                    const dataGrid = l
                        ? { x: l.x, y: l.y, w: l.w, h: l.h }
                        : { x: widget.position?.x ?? 0, y: widget.position?.y ?? 0, w: widget.position?.w ?? 4, h: widget.position?.h ?? 3 };

                    return (
                        <div key={widget.id} data-grid={dataGrid} className="h-full">
                            <WidgetCard
                                widget={widget}
                                isEditing={isEditing}
                                onRemove={onRemoveWidget}
                                w={dataGrid.w}
                                h={dataGrid.h}
                            />
                        </div>
                    );
                })}
            </ResponsiveGridLayout>
        </div>
    );
}
