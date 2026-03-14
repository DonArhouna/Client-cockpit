import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useFilters } from '@/context/FilterContext';
import { Skeleton } from '@/components/ui/skeleton';

interface VarianceVisualProps {
    kpiKey: string;
    isCompact?: boolean;
}

export function VarianceVisual({ kpiKey, isCompact }: VarianceVisualProps) {
    const { currency } = useFilters();
    const { data: kpiData, isLoading } = useKpiData(kpiKey);
    const currencySymbol = currency === 'XOF' ? 'F' : currency === 'EUR' ? '€' : '$';

    if (isLoading) {
        return (
            <div className="h-full w-full p-4 flex flex-col gap-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="flex-1 w-full" />
            </div>
        );
    }

    // Simulation de données d'écart si non présentes
    // Idéalement, le backend envoie un tableau d'écarts dans details
    const rawData = kpiData?.details?.items || kpiData?.details || [];
    const data = Array.isArray(rawData) && rawData.length > 0 ? rawData.map(item => ({
        name: item.name || item.Section || item.category || 'N/A',
        real: item.real || item.Montant_Realise || 0,
        budget: item.budget || item.Montant_Budget || 0,
        variance: item.variance || (item.real - item.budget) || 0,
        variancePercent: item.variancePercent || (item.budget !== 0 ? ((item.real - item.budget) / item.budget) * 100 : 0)
    })) : [];

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 italic text-sm py-8 text-center">
                Aucune donnée de budget/réalisé disponible<br/>
                <span className="text-[10px] mt-1">(Veuillez vérifier vos sections analytiques)</span>
            </div>
        );
    }

    if (isCompact) {
        const totalVariance = data.reduce((acc, item) => acc + item.variance, 0);
        return (
            <div className="flex flex-col h-full justify-center">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Écart Global</span>
                    <span className={cn("text-lg font-black", totalVariance >= 0 ? "text-emerald-500" : "text-rose-500")}>
                        {totalVariance > 0 ? '+' : ''}{totalVariance.toLocaleString()}{currencySymbol}
                    </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                    {data.slice(0, 5).map((item, idx) => (
                        <div 
                            key={idx}
                            className={item.variance >= 0 ? "bg-emerald-400" : "bg-rose-400"}
                            style={{ width: `${100 / Math.min(data.length, 5)}%`, opacity: 0.2 + (idx * 0.15) }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                        width={80}
                    />
                    <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => [`${value.toLocaleString()} ${currencySymbol}`, 'Écart']}
                    />
                    <ReferenceLine x={0} stroke="#cbd5e1" />
                    <Bar dataKey="variance" radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.variance >= 0 ? '#10b981' : '#f43f5e'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Assistant local pour éviter les imports circulaires ou complexes dans ce fichier temporaire
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
