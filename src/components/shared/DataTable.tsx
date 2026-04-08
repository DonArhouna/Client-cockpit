import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHeader,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, Settings2, RotateCcw } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useTableSettings } from "@/features/personalization/TableSettingsContext"
import { SortableHeader } from "./DataTable/SortableHeader"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    isLoading?: boolean
    className?: string
    onRowClick?: (row: TData) => void
    tableId?: string // Identifiant unique pour la persistance des réglages
}

/**
 * Composant de tableau de données avancé.
 * Gère le tri, le filtrage, la pagination, le réordonnancement des colonnes (DnD),
 * la visibilité et le renommage personnalisé des en-têtes.
 */
export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder,
    isLoading,
    className,
    onRowClick,
    tableId,
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation()
    const { getTableSettings, updateTableSettings, resetTableSettings } = useTableSettings()
    
    // États internes de TanStack Table
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = React.useState({})

    // Récupération des réglages persistés
    const settings = tableId ? getTableSettings(tableId) : null
    
    // État de visibilité des colonnes (synchronisé avec les réglages)
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
        settings?.columnVisibility || {}
    )

    // État de l'ordre des colonnes (synchronisé avec les réglages)
    const [columnOrder, setColumnOrder] = React.useState<string[]>(
        settings?.columnOrder || columns.map(c => c.id || (c as any).accessorKey as string).filter(Boolean)
    )

    // Synchronisation de la visibilité si les réglages changent (ex: reset)
    React.useEffect(() => {
        if (settings?.columnVisibility) {
            setColumnVisibility(settings.columnVisibility);
        }
    }, [settings?.columnVisibility]);

    // Synchronisation de l'ordre si les réglages changent
    React.useEffect(() => {
        if (settings?.columnOrder && settings.columnOrder.length > 0) {
            setColumnOrder(settings.columnOrder);
        }
    }, [settings?.columnOrder]);

    // Capteurs pour le Drag & Drop
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    /**
     * Gère la fin d'un glisser-déposer de colonne.
     */
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setColumnOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                if (tableId) {
                    updateTableSettings(tableId, { columnOrder: newOrder });
                }
                return newOrder;
            });
        }
    };

    /**
     * Gère le changement de visibilité des colonnes.
     */
    const handleVisibilityChange = (updater: any) => {
        const next = typeof updater === 'function' ? updater(columnVisibility) : updater;
        setColumnVisibility(next);
        if (tableId) {
            updateTableSettings(tableId, { columnVisibility: next });
        }
    };

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: handleVisibilityChange,
        onRowSelectionChange: setRowSelection,
        onColumnOrderChange: setColumnOrder,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            columnOrder,
        },
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-6 pt-4">
                <div className="flex flex-1 items-center space-x-2">
                    {searchKey && (
                        <Input
                            placeholder={searchPlaceholder || t('dataTable.filterBy', { key: searchKey })}
                            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn(searchKey)?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm h-8"
                        />
                    )}
                </div>
                <div className="flex items-center space-x-2 ml-auto">
                    {tableId && settings && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground"
                            onClick={() => resetTableSettings(tableId)}
                            title={t('dataTable.reset')}
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            <span className="hidden lg:inline">{t('dataTable.reset')}</span>
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 lg:flex"
                            >
                                <Settings2 className="mr-2 h-4 w-4" />
                                {t('dataTable.columns')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" && column.getCanHide()
                                )
                                .map((column) => {
                                    const customLabel = settings?.customLabels[column.id];
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className={cn("capitalize")}
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {customLabel || column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            
            <div className={cn("mx-6 rounded-md border", className)}>
                <Table>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    <SortableContext
                                        items={columnOrder}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {headerGroup.headers.map((header) => {
                                            const customLabel = settings?.customLabels[header.column.id];
                                            return (
                                                <SortableHeader
                                                    key={header.id}
                                                    header={header}
                                                    tableId={tableId || 'default'}
                                                    customLabel={customLabel}
                                                />
                                            );
                                        })}
                                    </SortableContext>
                                </TableRow>
                            ))}
                        </TableHeader>
                    </DndContext>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((_, j) => (
                                        <TableCell key={j} className="h-16 py-4">
                                            <Skeleton className="h-6 w-full opacity-60" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn("hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors group", onRowClick ? "cursor-pointer" : "cursor-default")}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    {t('dataTable.noResults')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4 px-6">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length > 0 ? (
                        <>
                            Affichage de <span className="font-medium">{table.getRowModel().rows.length}</span> sur{" "}
                            <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> résultats
                        </>
                    ) : (
                        "Aucun résultat"
                    )}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t('dataTable.previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {t('dataTable.next')}
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

