import { Column } from "@tanstack/react-table"
import { MoreVertical, ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, Edit2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
    onRename?: (newTitle: string) => void
}

/**
 * En-tête de colonne enrichi avec :
 * - Tri (Asc/Desc)
 * - Masquage
 * - Renommage Inline
 * - Menu d'options (3 points)
 */
export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
    onRename,
}: DataTableColumnHeaderProps<TData, TValue>) {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(title)

    useEffect(() => {
        setValue(title)
    }, [title])

    if (!column.getCanSort() && !column.getCanHide() && !onRename) {
        return <div className={cn(className)}>{title}</div>
    }

    const handleSave = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (value.trim() && value !== title) {
            onRename?.(value)
        }
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave()
        if (e.key === 'Escape') {
            setValue(title)
            setIsEditing(false)
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center space-x-2 min-w-[120px]">
                <Input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => handleSave()}
                    className="h-7 px-2 text-[11px] font-bold uppercase"
                />
                <div className="flex items-center gap-1">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-green-600"
                        onClick={handleSave}
                    >
                        <Check className="h-3 w-3" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-red-600"
                        onClick={() => { setValue(title); setIsEditing(false); }}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("flex items-center space-x-2 group/header", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="text-[11px] font-bold uppercase truncate max-w-[150px]">{title}</span>
                        {column.getCanSort() && (
                            <div className="ml-2">
                                {column.getIsSorted() === "desc" ? (
                                    <ArrowDown className="h-3 w-3" />
                                ) : column.getIsSorted() === "asc" ? (
                                    <ArrowUp className="h-3 w-3" />
                                ) : (
                                    <ChevronsUpDown className="h-3 w-3 opacity-50 group-hover/header:opacity-100" />
                                )}
                            </div>
                        )}
                        <MoreVertical className="ml-1 h-3 w-3 opacity-0 group-hover/header:opacity-100 transition-opacity" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-lg border-border/70">
                    {column.getCanSort() && (
                        <>
                            <DropdownMenuItem onClick={() => column.toggleSorting(false)} className="text-[13px]">
                                <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Trier par ordre croissant
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => column.toggleSorting(true)} className="text-[13px]">
                                <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Trier par ordre décroissant
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    {onRename && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)} className="text-[13px]">
                            <Edit2 className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                            Renommer la colonne
                        </DropdownMenuItem>
                    )}
                    {column.getCanHide() && (
                        <DropdownMenuItem onClick={() => column.toggleVisibility(false)} className="text-[13px] text-red-500 hover:text-red-600">
                            <EyeOff className="mr-2 h-3.5 w-3.5" />
                            Masquer la colonne
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
