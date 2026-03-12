import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useKpiData } from '@/hooks/use-kpi-data';
import { useFilters } from '@/context/FilterContext';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  const { currency } = useFilters();
  const { data, isLoading, error } = useKpiData('revenue_evolution', { enabled: true });

  // Données mockées pour le développement si pas de données backend
  const mockData = [
    { month: 'Jan', revenue: 1000000, profit: 150000, margin: 15 },
    { month: 'Fév', revenue: 1100000, profit: 165000, margin: 15 },
    { month: 'Mar', revenue: 1200000, profit: 180000, margin: 15 },
    { month: 'Avr', revenue: 1150000, profit: 172500, margin: 15 },
    { month: 'Mai', revenue: 1300000, profit: 195000, margin: 15 },
    { month: 'Juin', revenue: 1400000, profit: 210000, margin: 15 },
  ];

  const chartData = data?.series || mockData;

  const formatValue = (value: number) => {
    if (currency === 'XOF') {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return `${(value / 1000000).toFixed(1)}M`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center text-sm text-red-600">
            Erreur de chargement des données
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Analyse des performances financières par période</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">Chiffre d'affaires</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">Bénéfice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-slate-600">Marge</span>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickFormatter={formatValue}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => [formatValue(value), '']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="CA"
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorProfit)" 
              name="Bénéfice"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Croissance moyenne: <span className="font-semibold text-slate-700">+8.2%</span></span>
          </div>
          <div>
            <span>Dernière mise à jour: <span className="font-semibold text-slate-700">Il y a 5 min</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
