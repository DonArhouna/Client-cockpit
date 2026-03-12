import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Filter, Calendar } from 'lucide-react';

export function ReceivablesAnalysis() {
    const receivablesData = [
        { range: '0-30 jours', amount: 450000, percentage: 56.3, risk: 'Faible', color: 'bg-emerald-500' },
        { range: '31-60 jours', amount: 180000, percentage: 22.5, risk: 'Modéré', color: 'bg-amber-500' },
        { range: '61-90 jours', amount: 95000, percentage: 11.9, risk: 'Élevé', color: 'bg-rose-500' },
        { range: '90+ jours', amount: 75000, percentage: 9.4, risk: 'Critique', color: 'bg-red-900' }
    ];

    const total = receivablesData.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Card className="bg-white dark:bg-slate-900 border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg font-black text-foreground dark:text-white">Analyse de l'Âge des Créances</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Répartition par tranche d'ancienneté</p>
                    </div>
                    <Button variant="outline" size="sm" className="dark:border-slate-600 dark:hover:bg-slate-800">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Donut Chart */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-64 h-64">
                            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                                {/* Donut segments */}
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="40" strokeDasharray="282 282" strokeDashoffset="0" />
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="40" strokeDasharray="159 282" strokeDashoffset="-282" />
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#ef4444" strokeWidth="40" strokeDasharray="84 282" strokeDashoffset="-441" />
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#7f1d1d" strokeWidth="40" strokeDasharray="66 282" strokeDashoffset="-525" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-xs text-muted-foreground dark:text-slate-400 font-bold">Total des Créances</p>
                                <p className="text-2xl font-black text-foreground dark:text-white">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(total)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Legend with details */}
                    <div className="space-y-3">
                        {receivablesData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-accent/50 dark:bg-slate-800 rounded-lg hover:bg-accent transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground dark:text-white">{item.range}</p>
                                        <p className={`text-xs font-medium ${
                                            item.risk === 'Faible' ? 'text-emerald-600 dark:text-emerald-400' :
                                            item.risk === 'Modéré' ? 'text-amber-600 dark:text-amber-400' :
                                            item.risk === 'Élevé' ? 'text-rose-600 dark:text-rose-400' : 'text-red-900 dark:text-red-700'
                                        }`}>
                                            Risque {item.risk}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-foreground dark:text-white">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.amount)}
                                    </p>
                                    <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium">{item.percentage}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-2 dark:hover:bg-slate-800">
                            <Filter className="h-4 w-4" />
                            Filtrer par client
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 dark:hover:bg-slate-800">
                            <Calendar className="h-4 w-4" />
                            Planifier relances
                        </Button>
                    </div>
                    <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400">
                        Analyse des tendances
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
