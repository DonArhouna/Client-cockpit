import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, FileText, Download } from 'lucide-react';
import { useState } from 'react';

export function CashFlowChart() {
    const [_view, _setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    return (
        <Card className="bg-white dark:bg-slate-900 border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg font-black text-foreground dark:text-white">Évolution des Flux de Trésorerie</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Analyse historique et projections des mouvements de trésorerie</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2 dark:border-slate-600 dark:hover:bg-slate-800">
                            <BarChart3 className="h-4 w-4" />
                            Quotidien
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 dark:hover:bg-slate-800">
                            <Calendar className="h-4 w-4" />
                            Hebdomadaire
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 dark:hover:bg-slate-800">
                            <FileText className="h-4 w-4" />
                            Mensuel
                        </Button>
                        <Button variant="outline" size="sm" className="dark:border-slate-600 dark:hover:bg-slate-800">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-4">
                    <Button variant="outline" size="sm" className="gap-2 bg-blue-900 dark:bg-blue-800 text-white hover:bg-blue-800 dark:hover:bg-blue-700">
                        Projections
                    </Button>
                </div>

                {/* Chart placeholder - would use recharts or similar */}
                <div className="h-[300px] relative">
                    <svg className="w-full h-full" viewBox="0 0 800 300">
                        {/* Grid lines */}
                        <line x1="0" y1="50" x2="800" y2="50" stroke={document.documentElement.classList.contains('dark') ? "#334155" : "#e2e8f0"} strokeWidth="1" />
                        <line x1="0" y1="100" x2="800" y2="100" stroke={document.documentElement.classList.contains('dark') ? "#334155" : "#e2e8f0"} strokeWidth="1" />
                        <line x1="0" y1="150" x2="800" y2="150" stroke={document.documentElement.classList.contains('dark') ? "#334155" : "#e2e8f0"} strokeWidth="1" />
                        <line x1="0" y1="200" x2="800" y2="200" stroke={document.documentElement.classList.contains('dark') ? "#334155" : "#e2e8f0"} strokeWidth="1" />
                        <line x1="0" y1="250" x2="800" y2="250" stroke={document.documentElement.classList.contains('dark') ? "#334155" : "#e2e8f0"} strokeWidth="1" />

                        {/* Flux Réel (blue) */}
                        <polyline
                            points="50,180 150,160 250,170 350,140 450,130 550,145 650,135 750,150"
                            fill="none"
                            stroke="#1e3a8a"
                            strokeWidth="3"
                        />

                        {/* Flux Projeté (light blue dashed) */}
                        <polyline
                            points="50,170 150,150 250,160 350,130 450,120 550,135 650,125 750,140"
                            fill="none"
                            stroke="#60a5fa"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />

                        {/* Entrées (green) */}
                        <polyline
                            points="50,220 150,210 250,215 350,200 450,195 550,205 650,200 750,210"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                        />

                        {/* Sorties (red) */}
                        <polyline
                            points="50,80 150,90 250,85 350,100 450,105 550,95 650,100 750,90"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                        />

                        {/* Tooltip on hover point */}
                        <circle cx="450" cy="130" r="4" fill="#1e3a8a" />
                    </svg>

                    {/* Tooltip */}
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-popover p-3 rounded-lg shadow-lg border border-border text-xs">
                        <p className="font-bold text-muted-foreground mb-2">10/01</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-900"></div>
                                <span className="text-muted-foreground">Flux Réel:</span>
                                <span className="font-bold">820 000 €</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                                <span className="text-muted-foreground">Flux Projeté:</span>
                                <span className="font-bold">850 000 €</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="text-muted-foreground">Entrées:</span>
                                <span className="font-bold">480 000 €</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                                <span className="text-muted-foreground">Sorties:</span>
                                <span className="font-bold">-410 000 €</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-900 dark:bg-blue-700"></div>
                        <span className="text-muted-foreground dark:text-slate-400 font-medium">Flux Réel</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                        <span className="text-muted-foreground dark:text-slate-400 font-medium">Flux Projeté</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                        <span className="text-muted-foreground dark:text-slate-400 font-medium">Entrées</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                        <span className="text-muted-foreground dark:text-slate-400 font-medium">Sorties</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
