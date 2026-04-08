import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Header } from '@tanstack/react-table';
import { TableHead } from '@/components/ui/table';
import { HeaderMenu } from './HeaderMenu';
import { cn } from '@/lib/utils';
import { GripHorizontal } from 'lucide-react';

interface SortableHeaderProps<TData, TValue> {
    header: Header<TData, TValue>;
    tableId: string;
    customLabel?: string;
}

/**
 * En-tête de colonne déplaçable (Drag & Drop).
 * Intègre le menu d'options (HeaderMenu).
 */
export function SortableHeader<TData, TValue>({
    header,
    tableId,
    customLabel,
}: SortableHeaderProps<TData, TValue>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: header.column.id });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 0,
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
    };

    const title = customLabel || (header.isPlaceholder ? '' : header.column.columnDef.header as string);

    return (
        <TableHead
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative select-none",
                isDragging && "bg-accent/50"
            )}
        >
            <div className="flex items-center">
                {/* Poignée de drag & drop invisible par défaut, apparaît au hover */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity p-1 -ml-6 mr-1"
                >
                    <GripHorizontal className="h-3 w-3 text-muted-foreground" />
                </div>

                <HeaderMenu
                    column={header.column}
                    tableId={tableId}
                    title={title}
                />
            </div>
        </TableHead>
    );
}
