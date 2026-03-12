import { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardEditContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (value: boolean) => void;
    toggleEditMode: () => void;
}

const DashboardEditContext = createContext<DashboardEditContextType | undefined>(undefined);

export function DashboardEditProvider({ children }: { children: ReactNode }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleEditMode = () => {
        const nextState = !isEditing;
        setIsEditing(nextState);
        setIsSidebarOpen(nextState);
    };

    return (
        <DashboardEditContext.Provider value={{
            isEditing,
            setIsEditing,
            isSidebarOpen,
            setIsSidebarOpen,
            toggleEditMode
        }}>
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
