import { Search, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface KpiSearchBarProps {
    placeholder?: string;
    defaultValue?: string;
    className?: string;
}

export function KpiSearchBar({ placeholder, defaultValue = '', className }: KpiSearchBarProps) {
    const [query, setQuery] = useState(defaultValue);
    const navigate = useNavigate();

    const handleSearch = () => {
        if (!query.trim()) return;
        // Navigation vers la page d'intelligence avec la requête en paramètre
        navigate(`/intelligence?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className={`relative w-full max-w-2xl ${className}`}>
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
                type="text"
                placeholder={placeholder || "Posez votre question sur vos données"}
                className="pl-9 pr-32 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm w-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute right-1 top-1 flex items-center gap-1">
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <Mic className="h-4 w-4 text-slate-400 dark:text-slate-500 hover:text-primary" />
                </button>
                <Button
                    size="sm"
                    className="h-7 rounded-full px-4 bg-[#3b66ac] hover:bg-[#2d5089] text-white transition-colors"
                    onClick={handleSearch}
                >
                    Analyser
                </Button>
            </div>
        </div>
    );
}
