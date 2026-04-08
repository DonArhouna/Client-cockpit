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
    ColumnOrderState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
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
import { useAuth } from "@/features/auth/AuthContext"
import { DataTableColumnHeader } from "./DataTableColumnHeader"

// DnD Kit imports
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    type DragEndEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DataTableProps<TData, TValue> {
    tableId: string // Identifiant unique pour la persistance
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    isLoading?: boolean
    className?: string
    onRowClick?: (row: TData) => void
    // Configuration optionnelle persistée via le parent (ex: widget config)
    externalConfig?: {
        columnOrder?: string[]
        columnVisibility?: VisibilityState
        columnAliases?: Record<string, string>
    }
    onConfigChangeAction?: (config: {
        columnOrder: string[]
        columnVisibility: VisibilityState
        columnAliases: Record<string, string>
    }) => void
}

/**
 * Composant de cellule d'en-tête draggable
 */
function DraggableTableHeader({ header, table, onRename, displayTitle }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: header.id,
        })

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: isDragging ? 'grabbing' : 'auto',
        zIndex: isDragging ? 20 : 0,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
    }

    return (
        <TableHead
            ref={setNodeRef}
            style={style}
            key={header.id}
            className="p-0"
        >
            <div className="flex items-center">
                {/* Poignée de drag invisible mais activable par tout l'en-tête sauf le menu */}
                <div {...attributes} {...listeners} className="absolute inset-0 z-0" />
                
                <div className="relative z-10 w-full px-4 py-1">
                    {header.isPlaceholder
                        ? null
                        : <DataTableColumnHeader 
                            column={header.column} 
                            title={displayTitle} 
                            onRename={onRename}
                          />
                    }
                </div>
            </div>
        </TableHead>
    )
}

/**
 * DataTable Premium avec :
 * - Persistance par utilisateur
 * - Drag & Drop des colonnes
 * - Renommage des colonnes (Alias)
 * - Masquage des colonnes
 * - Réinitialisation
 */
export function DataTable<TData, TValue>({
    tableId,
    columns,
    data,
    searchKey,
    searchPlaceholder,
    isLoading,
    className,
    onRowClick,
    externalConfig,
    onConfigChangeAction,
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation()
    const { user } = useAuth()
    
    // Identifiant de stockage local (isolé par utilisateur et par tableau)
    const storageKey = React.useMemo(() => 
        `cockpit_table_${tableId}_user_${user?.id || 'guest'}`, 
    [tableId, user?.id])

    // États du tableau
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    
    // États persistés (initialisés depuis localStorage ou config externe)
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
        if (externalConfig?.columnVisibility) return externalConfig.columnVisibility
        const saved = localStorage.getItem(`${storageKey}_visibility`)
        return saved ? JSON.parse(saved) : {}
    })
    
    const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() => {
        if (externalConfig?.columnOrder) return externalConfig.columnOrder
        const saved = localStorage.getItem(`${storageKey}_order`)
        return saved ? JSON.parse(saved) : columns.map((c) => c.id!)
    })

    const [columnAliases, setColumnAliases] = React.useState<Record<string, string>>(() => {
        if (externalConfig?.columnAliases) return externalConfig.columnAliases
        const saved = localStorage.getItem(`${storageKey}_aliases`)
        return saved ? JSON.parse(saved) : {}
    })

    const [rowSelection, setRowSelection] = React.useState({})

    // Sauvegarde automatique des réglages
    React.useEffect(() => {
        const config = { columnOrder, columnVisibility, columnAliases }
        localStorage.setItem(`${storageKey}_visibility`, JSON.stringify(columnVisibility))
        localStorage.setItem(`${storageKey}_order`, JSON.stringify(columnOrder))
        localStorage.setItem(`${storageKey}_aliases`, JSON.stringify(columnAliases))
        onConfigChangeAction?.(config)
    }, [columnVisibility, columnOrder, columnAliases, storageKey, onConfigChangeAction])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            columnOrder,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    // Capteurs pour le DnD
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor)
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setColumnOrder((prev) => {
                const oldIndex = prev.indexOf(active.id as string)
                const newIndex = prev.indexOf(over.id as string)
                const newOrder = [...prev]
                newOrder.splice(oldIndex, 1)
                newOrder.splice(newIndex, 0, active.id as string)
                return newOrder
            })
        }
    }

    const resetLayout = () => {
        setColumnOrder(columns.map((c) => (c.id || (c as any).accessorKey) as string))
        setColumnVisibility({})
        setColumnAliases({})
        localStorage.removeItem(`${storageKey}_visibility`)
        localStorage.removeItem(`${storageKey}_order`)
        localStorage.removeItem(`${storageKey}_aliases`)
    }

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
                <div className="flex items-center gap-2 ml-auto">
                    {/* Bouton de réinitialisation */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetLayout}
                        className="h-8 px-2 text-slate-500 hover:text-primary transition-colors"
                        title="Rétablir la vue par défaut"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Rétablir</span>
                    </Button>

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
                        <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-lg">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" && column.getCanHide()
                                )
                                .map((column) => {
                                    const title = columnAliases[column.id] || (column.columnDef as any).header || column.id
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className={cn("capitalize text-[13px]")}
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {title}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            
            <div className={cn("mx-6 rounded-md border overflow-hidden", className)}>
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToHorizontalAxis]}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                >
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    <SortableContext
                                        items={columnOrder}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {headerGroup.headers.map((header) => {
                                            const originalTitle = (header.column.columnDef as any).header || header.id
                                            const displayTitle = columnAliases[header.id] || originalTitle
                                            
                                            return (
                                                <DraggableTableHeader 
                                                    key={header.id} 
                                                    header={header} 
                                                    table={table}
                                                    displayTitle={displayTitle}
                                                    onRename={(newTitle: string) => {
                                                        setColumnAliases(prev => ({ ...prev, [header.id]: newTitle }))
                                                    }}
                                                />
                                            )
                                        })}
                                    </SortableContext>
                                </TableRow>
                            ))}
                        </TableHeader>
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
                </DndContext>
            </div>
            
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground px-6">
                    {table.getFilteredRowModel().rows.length > 0 ? (
                        <>
                            Affichage de <span className="font-medium">{table.getRowModel().rows.length}</span> sur{" "}
                            <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> résultats
                        </>
                    ) : (
                        "Aucun résultat"
                    )}
                </div>
                <div className="space-x-2 px-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {t('dataTable.previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {t('dataTable.next')}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
