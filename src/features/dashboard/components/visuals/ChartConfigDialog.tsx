import { useState } from 'react';
import {
    DndContext, DragEndEvent, DragStartEvent,
    useDraggable, useDroppable, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Settings2, RotateCcw, X, GripVertical, Loader2 } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ChartAxisConfig {
    nameKey?: string;
    valueKey?: string;
}

interface ChartConfigDialogProps {
    open: boolean;
    onClose: () => void;
    allKeys: string[];
    currentConfig: ChartAxisConfig;
    onSave: (config: ChartAxisConfig) => void;
    isLoading?: boolean;
    title?: string;
    applyLabel?: string;
}

// ── Draggable column pill ────────────────────────────────────────────────────
// No DragOverlay — Dialog's translate(-50%,-50%) corrupts overlay coordinates.
// Apply transform directly to element; overflow-hidden removed so it moves freely.
function DraggableColumn({ id, label, dimmed }: { id: string; label: string; dimmed?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                transform: CSS.Transform.toString(transform),
                zIndex: isDragging ? 9999 : undefined,
            }}
            className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium cursor-grab active:cursor-grabbing select-none',
                isDragging
                    ? 'opacity-90 bg-primary text-white border-primary shadow-2xl scale-105 transition-none'
                    : dimmed
                        ? 'bg-primary/5 border-primary/20 text-primary/40 dark:text-primary/30 transition-opacity'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:bg-primary/5 shadow-sm transition-opacity',
            )}
        >
            <GripVertical className="h-3 w-3 shrink-0 opacity-50" />
            <span className="truncate max-w-[130px]">{label}</span>
        </div>
    );
}

// ── Droppable axis zone — reads its own isOver ────────────────────────────────
function AxisDropZone({
    id, label, value, onClear,
}: {
    id: string;
    label: string;
    value?: string;
    onClear: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            <div
                ref={setNodeRef}
                className={cn(
                    'min-h-[56px] rounded-xl border-2 border-dashed transition-all flex items-center px-3 py-2',
                    isOver
                        ? 'border-primary bg-primary/8 dark:bg-primary/15 scale-[1.01]'
                        : value
                            ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50',
                )}
            >
                {value ? (
                    <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                            <span className="text-[13px] font-semibold text-primary truncate max-w-[160px]">{value}</span>
                        </div>
                        <button
                            onClick={onClear}
                            className="h-5 w-5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ) : (
                    <span className={cn(
                        'text-[12px] transition-colors',
                        isOver ? 'text-primary font-semibold' : 'text-slate-300 dark:text-slate-600'
                    )}>
                        {isOver ? '↓ Déposer ici' : 'Glisser une colonne…'}
                    </span>
                )}
            </div>
        </div>
    );
}

// ── Main dialog ──────────────────────────────────────────────────────────────
export function ChartConfigDialog({
    open, onClose, allKeys, currentConfig, onSave,
    isLoading = false,
    title = 'Configurer les axes du graphique',
    applyLabel = 'Appliquer',
}: ChartConfigDialogProps) {
    const [nameKey, setNameKey] = useState<string>(currentConfig.nameKey ?? '');
    const [valueKey, setValueKey] = useState<string>(currentConfig.valueKey ?? '');

    // PointerSensor only — MouseSensor + TouchSensor conflict with PointerSensor
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    );

    const handleDragStart = (_e: DragStartEvent) => { /* pill style handled by isDragging */ };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over) return;
        const col = String(active.id);
        const zone = String(over.id);
        if (zone === 'nameKey') setNameKey(col);
        if (zone === 'valueKey') setValueKey(col);
    };

    const handleApply = () => {
        onSave({ nameKey: nameKey || undefined, valueKey: valueKey || undefined });
    };

    const handleReset = () => {
        setNameKey('');
        setValueKey('');
        onSave({});
    };

    const isManual = !!(currentConfig.nameKey || currentConfig.valueKey);
    const assignedKeys = new Set([nameKey, valueKey].filter(Boolean));

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            {/* No overflow-hidden — clips draggable transform */}
            <DialogContent className="sm:max-w-[580px] rounded-2xl p-0">
                <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/50">
                    <DialogTitle className="flex items-center gap-2 text-[15px]">
                        <Settings2 className="h-4 w-4 text-primary" />
                        {title}
                    </DialogTitle>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                        Glissez les colonnes vers les zones correspondantes
                    </p>
                </DialogHeader>

                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex min-h-[280px]">
                        {/* ── Left: available columns ── */}
                        <div className="w-[200px] shrink-0 border-r border-border/50 bg-slate-50 dark:bg-slate-800/30 p-4 flex flex-col gap-2 rounded-none">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Colonnes disponibles
                            </span>
                            {isLoading ? (
                                <div className="flex flex-col gap-2 pt-1">
                                    <Loader2 className="h-4 w-4 text-primary animate-spin mb-1 mx-auto" />
                                    {[80, 110, 95, 70].map((w, i) => (
                                        <Skeleton key={i} className="h-7 rounded-lg" style={{ width: w }} />
                                    ))}
                                </div>
                            ) : allKeys.length === 0 ? (
                                <span className="text-[11px] text-slate-300 italic">
                                    Aucune colonne détectée
                                </span>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {allKeys.map((k) => (
                                        <DraggableColumn
                                            key={k}
                                            id={k}
                                            label={k}
                                            dimmed={assignedKeys.has(k)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Right: axis drop zones ── */}
                        <div className="flex-1 p-5 flex flex-col gap-5 justify-center">
                            <AxisDropZone
                                id="nameKey"
                                label="Axe X — Libellé (catégorie)"
                                value={nameKey}
                                onClear={() => setNameKey('')}
                            />
                            <AxisDropZone
                                id="valueKey"
                                label="Axe Y — Valeur (mesure)"
                                value={valueKey}
                                onClear={() => setValueKey('')}
                            />

                            {isManual && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                                    Configuration manuelle active — détection automatique désactivée.
                                </p>
                            )}
                        </div>
                    </div>

                </DndContext>

                <DialogFooter className="px-6 py-4 border-t border-border/50 flex-row justify-between sm:justify-between gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-slate-700 text-[12px] gap-1.5"
                        onClick={handleReset}
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Réinitialiser
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-[13px]" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button size="sm" className="text-[13px] bg-primary" onClick={handleApply}>
                            {applyLabel}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
