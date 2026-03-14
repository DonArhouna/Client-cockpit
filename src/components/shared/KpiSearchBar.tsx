import { Search, Mic, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiSearchBarProps {
    placeholder?: string;
    defaultValue?: string;
    className?: string;
}

export function KpiSearchBar({ placeholder, defaultValue = '', className }: KpiSearchBarProps) {
    const [query, setQuery] = useState(defaultValue);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStep, setProcessStep] = useState(0);
    const navigate = useNavigate();

    const processingSteps = [
        { id: 1, label: "Analyse de la requête..." },
        { id: 2, label: "Recherche des indicateurs pertinents..." },
        { id: 3, label: "Traitement des données en cours..." },
    ];

    const handleSearch = () => {
        if (!query.trim()) return;
        
        setIsProcessing(true);
        setProcessStep(1);

        // Simulation des étapes comme sur la page intelligente
        setTimeout(() => setProcessStep(2), 1200);
        setTimeout(() => setProcessStep(3), 2400);
        setTimeout(() => {
            setIsProcessing(false);
            setProcessStep(0);
            navigate(`/intelligence?q=${encodeURIComponent(query)}`);
        }, 3600);
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

            {/* Modal de traitement en cours */}
            <Dialog open={isProcessing} onOpenChange={setIsProcessing}>
                <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
                    <Card className="border shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                    <div className="relative h-16 w-16 flex items-center justify-center bg-primary/10 rounded-full">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Traitement en cours</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Veuillez patienter pendant que nous analysons vos données</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {processingSteps.map((step) => (
                                    <div key={step.id} className={cn(
                                        "flex items-center gap-4 p-3 rounded-lg transition-all duration-500",
                                        processStep >= step.id ? "bg-primary/5 opacity-100" : "opacity-40"
                                    )}>
                                        <div className={cn(
                                            "h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                            processStep > step.id
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : processStep === step.id
                                                    ? "bg-primary border-primary text-white"
                                                    : "border-slate-200 dark:border-slate-700 text-slate-400"
                                        )}>
                                            {processStep > step.id
                                                ? <CheckCircle2 className="h-4 w-4" />
                                                : <span className="text-xs font-bold">{step.id}</span>
                                            }
                                        </div>
                                        <span className={cn(
                                            "font-medium text-sm transition-colors",
                                            processStep >= step.id ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
                                        )}>
                                            {step.label}
                                        </span>
                                        {processStep === step.id && (
                                            <div className="ml-auto flex space-x-1">
                                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>
        </div>
    );
}
