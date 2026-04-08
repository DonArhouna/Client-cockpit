import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

interface DashboardEditContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (value: boolean) => void;
    toggleEditMode: () => void;
    navCollapsed: boolean;
    setNavCollapsed: (value: boolean) => void;
}

const DashboardEditContext = createContext<DashboardEditContextType | undefined>(undefined);

export function DashboardEditProvider({ children }: { children: ReactNode }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [navCollapsed, setNavCollapsed] = useState(false);

    const toggleEditMode = useCallback(() => {
        const nextState = !isEditing;
        setIsEditing(nextState);
        setIsSidebarOpen(nextState);
        if (nextState) setNavCollapsed(true);
    }, [isEditing]);

    const value = useMemo(() => ({
        isEditing,
        setIsEditing,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleEditMode,
        navCollapsed,
        setNavCollapsed,
    }), [isEditing, isSidebarOpen, toggleEditMode, navCollapsed]);

    return (
        <DashboardEditContext.Provider value={value}>
            {children}
        </DashboardEditContext.Provider>
    );
}

export function useDashboardEdit() {
    const context = useContext(DashboardEditContext);
    if (context === undefined) {
        throw new Error('useDashboardEdit must be used within a DashboardEditProvider');
    }
    return context;
}
