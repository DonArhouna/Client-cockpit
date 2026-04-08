import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';

/**
 * Interface représentant les réglages d'un tableau spécifique.
 */
export interface TableSettings {
    columnOrder: string[];
    columnVisibility: Record<string, boolean>;
    customLabels: Record<string, string>;
}

interface TableSettingsContextType {
    getTableSettings: (tableId: string) => TableSettings | null;
    updateTableSettings: (tableId: string, settings: Partial<TableSettings>) => void;
    resetTableSettings: (tableId: string) => void;
}

const TableSettingsContext = createContext<TableSettingsContextType | undefined>(undefined);

/**
 * Provider pour la gestion des paramètres des tableaux.
 * Les réglages sont stockés dans le localStorage et isolés par utilisateur.
 */
export const TableSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [allSettings, setAllSettings] = useState<Record<string, TableSettings>>({});

    // Clé de stockage racine incluant l'ID utilisateur
    const storageKey = user ? `cockpit_table_prefs_${user.id}` : null;

    // Charger les réglages au montage ou au changement d'utilisateur
    useEffect(() => {
        if (storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    setAllSettings(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse table settings", e);
                }
            } else {
                setAllSettings({});
            }
        }
    }, [storageKey]);

    // Sauvegarder les réglages à chaque modification
    useEffect(() => {
        if (storageKey && Object.keys(allSettings).length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(allSettings));
        }
    }, [allSettings, storageKey]);

    /**
     * Récupère les réglages pour un tableau donné.
     */
    const getTableSettings = (tableId: string): TableSettings | null => {
        return allSettings[tableId] || null;
    };

    /**
     * Met à jour les réglages d'un tableau (fusionne avec l'existant).
     */
    const updateTableSettings = (tableId: string, settings: Partial<TableSettings>) => {
        setAllSettings(prev => ({
            ...prev,
            [tableId]: {
                ...(prev[tableId] || { columnOrder: [], columnVisibility: {}, customLabels: {} }),
                ...settings
            }
        }));
    };

    /**
     * Réinitialise les réglages d'un tableau.
     */
    const resetTableSettings = (tableId: string) => {
        setAllSettings(prev => {
            const next = { ...prev };
            delete next[tableId];
            return next;
        });
        // On force aussi le nettoyage dans le localStorage si c'était le dernier
        if (storageKey && Object.keys(allSettings).length <= 1) {
            localStorage.removeItem(storageKey);
        }
    };

    return (
        <TableSettingsContext.Provider value={{
            getTableSettings,
            updateTableSettings,
            resetTableSettings,
        }}>
            {children}
        </TableSettingsContext.Provider>
    );
};

/**
 * Hook personnalisé pour accéder aux réglages des tableaux.
 */
export const useTableSettings = () => {
    const context = useContext(TableSettingsContext);
    if (context === undefined) {
        throw new Error('useTableSettings doit être utilisé à l\'intérieur d\'un TableSettingsProvider');
    }
    return context;
};
