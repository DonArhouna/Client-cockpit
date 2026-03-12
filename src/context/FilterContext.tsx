import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Interface pour les filtres globaux du cockpit.
 */
interface FilterContextType {
    period: string;
    setPeriod: (period: string) => void;
    currency: string;
    setCurrency: (currency: string) => void;
    scope: string;
    setScope: (scope: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

/**
 * Provider pour les filtres globaux.
 * Permet de synchroniser la période, la devise et le périmètre sur tout le dashboard.
 */
export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [period, setPeriod] = useState('current_quarter');
    const [currency, setCurrency] = useState('XOF');
    const [scope, setScope] = useState('all');

    return (
        <FilterContext.Provider value={{ period, setPeriod, currency, setCurrency, scope, setScope }}>
            {children}
        </FilterContext.Provider>
    );
};

/**
 * Hook pour accéder aux filtres globaux.
 */
export const useFilters = () => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilters doit être utilisé à l\'intérieur d\'un FilterProvider');
    }
    return context;
};
