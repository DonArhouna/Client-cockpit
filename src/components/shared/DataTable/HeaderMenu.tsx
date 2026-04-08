import React, { useState } from 'react';
import { Column } from '@tanstack/react-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MoreVertical,
    ArrowUpNarrowWide,
    ArrowDownWideNarrow,
    EyeOff,
    Edit3,
    Check,
    RotateCcw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTableSettings } from '@/features/personalization/TableSettingsContext';

interface HeaderMenuProps<TData, TValue> {
    column: Column<TData, TValue>;
    tableId: string;
    title: string;
}

/**
 * Menu contextuel pour chaque en-tête de colonne.
 * Gère le tri, le masquage et le renommage via TableSettingsContext.
 */
export function HeaderMenu<TData, TValue>({
    column,
    tableId,
    title,
}: HeaderMenuProps<TData, TValue>) {
    const { t } = useTranslation();
    const { updateTableSettings, getTableSettings } = useTableSettings();
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(title);

    const handleRename = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (newName.trim()) {
            const currentSettings = getTableSettings(tableId);
            const customLabels = { ...(currentSettings?.customLabels || {}), [column.id]: newName.trim() };
            updateTableSettings(tableId, { customLabels });
            setIsRenaming(false);
        }
    };

    const handleResetName = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentSettings = getTableSettings(tableId);
        const customLabels = { ...(currentSettings?.customLabels || {}) };
        delete customLabels[column.id];
        updateTableSettings(tableId, { customLabels });
        setNewName(title);
        setIsRenaming(false);
    };

    const toggleSort = (desc: boolean) => {
        column.toggleSorting(desc);
    };

    const hideColumn = () => {
        column.toggleVisibility(false);
    };

    return (
        <div className="flex items-center space-x-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                        <span className="truncate">{title}</span>
                        <MoreVertical className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2">
                    {isRenaming ? (
                        <div className="flex items-center space-x-1 p-1" onClick={(e) => e.stopPropagation()}>
                            <Input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-8 text-xs"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRename(e as any);
                                    if (e.key === 'Escape') setIsRenaming(false);
                                }}
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleRename}>
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleResetName}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                                <Edit3 className="mr-2 h-4 w-4 text-muted-foreground/70" />
                                {t('dataTable.rename')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toggleSort(false)}>
                                <ArrowUpNarrowWide className="mr-2 h-4 w-4 text-muted-foreground/70" />
                                {t('dataTable.sortAsc')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleSort(true)}>
                                <ArrowDownWideNarrow className="mr-2 h-4 w-4 text-muted-foreground/70" />
                                {t('dataTable.sortDesc')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={hideColumn}>
                                <EyeOff className="mr-2 h-4 w-4 text-muted-foreground/70" />
                                {t('dataTable.hide')}
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
