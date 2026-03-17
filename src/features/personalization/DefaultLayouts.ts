export interface DefaultWidget {
    name: string;
    type: string;
    vizType: string;
    kpiKey: string;
    config: { unit: string; description: string };
    position: { x: number; y: number; w: number; h: number };
}

export const PAGE_DEFAULT_WIDGETS: Record<string, (kpis: any[]) => DefaultWidget[]> = {
    dashboard: (kpis) => {
        // Sélection réduite : CA, Marge Brute, Trésorerie, BFR
        const keys = ['ca', 'marge_brute', 'solde_tresorerie', 'bfr'];
        const selectedKpis = kpis
            .filter(kpi => kpi.isActive && keys.includes(kpi.key.toLowerCase()))
            .slice(0, 4);

        // Si on n'en trouve pas assez par clé, on prend les 4 premiers card-KPIs
        if (selectedKpis.length < 4) {
             const fallback = kpis
                .filter(kpi => kpi.isActive && kpi.defaultVizType === 'card')
                .slice(0, 4 - selectedKpis.length);
             selectedKpis.push(...fallback);
        }

        const widgets: DefaultWidget[] = selectedKpis.map((kpi, index) => ({
            name: kpi.name,
            type: 'kpi',
            vizType: 'card',
            kpiKey: kpi.key,
            config: { unit: kpi.unit ?? '', description: kpi.description ?? '' },
            position: { x: index * 3, y: 0, w: 3, h: 3 },
        }));

        widgets.push(
            {
                name: "Évolution du Chiffre d'Affaires",
                type: 'graph',
                kpiKey: 'revenue_evolution',
                vizType: 'line',
                config: { unit: '', description: '' },
                position: { x: 0, y: 3, w: 12, h: 4 },
            },
            {
                name: "Répartition par Catégorie",
                type: 'chart',
                kpiKey: 'revenue_by_category',
                vizType: 'pie',
                config: { unit: '', description: '' },
                position: { x: 0, y: 7, w: 6, h: 4 },
            }
        );
        return widgets;
    },
    revenue: (kpis) => {
        const revenueKpis = kpis
            .filter(kpi => kpi.isActive && ['finance', 'clients'].includes(kpi.category) && kpi.defaultVizType === 'card')
            .slice(0, 4);

        const widgets: DefaultWidget[] = revenueKpis.map((kpi, index) => ({
            name: kpi.name,
            type: 'kpi',
            vizType: 'card',
            kpiKey: kpi.key,
            config: { unit: kpi.unit ?? '', description: kpi.description ?? '' },
            position: { x: index * 3, y: 0, w: 3, h: 3 },
        }));

        widgets.push(
            {
                name: "Évolution des Revenus",
                type: 'graph',
                kpiKey: 'revenue_evolution',
                vizType: 'area',
                config: { unit: '', description: '' },
                position: { x: 0, y: 3, w: 12, h: 4 },
            },
            {
                name: "Balance Âgée Clients",
                type: 'list',
                kpiKey: 'accounts_receivable_age',
                vizType: 'list',
                config: { unit: '', description: '' },
                position: { x: 0, y: 7, w: 6, h: 5 },
            },
            {
                name: "Top Clients",
                type: 'table',
                kpiKey: 'top_clients',
                vizType: 'table',
                config: { unit: '', description: '' },
                position: { x: 6, y: 7, w: 6, h: 5 },
            }
        );
        return widgets;
    },
    finance: (kpis) => {
        const treasuryKpis = kpis
            .filter(kpi => kpi.isActive && ['tresorerie', 'finance'].includes(kpi.category) && kpi.defaultVizType === 'card')
            .slice(0, 4);

        const widgets: DefaultWidget[] = treasuryKpis.map((kpi, index) => ({
            name: kpi.name,
            type: 'kpi',
            vizType: 'card',
            kpiKey: kpi.key,
            config: { unit: kpi.unit ?? '', description: kpi.description ?? '' },
            position: { x: index * 3, y: 0, w: 3, h: 3 },
        }));

        widgets.push(
            {
                name: "Flux de Trésorerie Projets",
                type: 'widget',
                vizType: 'flux_tresorerie_chart',
                kpiKey: 'flux_tresorerie_chart',
                config: { unit: '', description: '' },
                position: { x: 0, y: 3, w: 12, h: 4 },
            },
            {
                name: "Répartition des Encaissements",
                type: 'widget',
                vizType: 'encaissements_pie',
                kpiKey: 'encaissements_pie',
                config: { unit: '', description: '' },
                position: { x: 0, y: 7, w: 6, h: 5 },
            },
            {
                name: "Analyse des Créances",
                type: 'widget',
                vizType: 'creances_analysis',
                kpiKey: 'creances_analysis',
                config: { unit: '', description: '' },
                position: { x: 6, y: 7, w: 6, h: 5 },
            }
        );
        return widgets;
    },
    operational: (kpis) => {
        const operationalKpis = kpis
            .filter(kpi => kpi.isActive && kpi.category === 'fournisseurs' && kpi.defaultVizType === 'card')
            .slice(0, 4);

        const widgets: DefaultWidget[] = operationalKpis.map((kpi, index) => ({
            name: kpi.name,
            type: 'kpi',
            vizType: 'card',
            kpiKey: kpi.key,
            config: { unit: kpi.unit ?? '', description: kpi.description ?? '' },
            position: { x: index * 3, y: 0, w: 3, h: 3 },
        }));

        widgets.push(
            {
                name: "Évolution des Achats",
                type: 'graph',
                kpiKey: 'purchases_evolution',
                vizType: 'area',
                config: { unit: '', description: '' },
                position: { x: 0, y: 3, w: 12, h: 4 },
            },
            {
                name: "Dettes Fournisseurs",
                type: 'list',
                kpiKey: 'dettes_fournisseurs_echeance',
                vizType: 'list',
                config: { unit: '', description: '' },
                position: { x: 0, y: 7, w: 6, h: 5 },
            },
            {
                name: "Top Fournisseurs",
                type: 'table',
                kpiKey: 'top10_fournisseurs_achats',
                vizType: 'table',
                config: { unit: '', description: '' },
                position: { x: 6, y: 7, w: 6, h: 5 },
            }
        );
        return widgets;
    },
    inventory: (kpis) => {
        const stockKpis = kpis
            .filter(kpi => kpi.isActive && kpi.category === 'stocks' && kpi.defaultVizType === 'card')
            .slice(0, 4);

        const widgets: DefaultWidget[] = stockKpis.map((kpi, index) => ({
            name: kpi.name,
            type: 'kpi',
            kpiKey: kpi.key,
            vizType: 'card',
            config: { unit: kpi.unit ?? '', description: kpi.description ?? '' },
            position: { x: index * 3, y: 0, w: 3, h: 3 },
        }));

        widgets.push(
            {
                name: 'Évolution de la Valeur de Stock',
                type: 'graph',
                kpiKey: 'inventory_evolution',
                vizType: 'area',
                config: { unit: '', description: '' },
                position: { x: 0, y: 3, w: 12, h: 4 },
            },
            {
                name: 'Top 10 Articles Valorisés',
                type: 'table',
                kpiKey: 'top10_articles_valorises',
                vizType: 'table',
                config: { unit: '', description: '' },
                position: { x: 0, y: 7, w: 12, h: 5 },
            }
        );
        return widgets;
    },
    accounting: (kpis) => {
        const accountingKpis = kpis
            .filter(kpi => kpi.isActive && kpi.category === 'comptabilite' && kpi.defaultVizType === 'card')
            .slice(0, 4);

        const widgets: DefaultWidget[] = accountingKpis.map((kpi, index) => ({
            name: kpi.name,
            type: 'kpi',
            kpiKey: kpi.key,
            vizType: 'card',
            config: { unit: kpi.unit ?? '', description: kpi.description ?? '' },
            position: { x: index * 3, y: 0, w: 3, h: 3 },
        }));

        widgets.push(
            {
                name: 'Évolution du P&L',
                type: 'graph',
                kpiKey: 'pnl_evolution',
                vizType: 'line',
                config: { unit: '', description: '' },
                position: { x: 0, y: 3, w: 12, h: 4 },
            },
            {
                name: 'Répartition des Charges',
                type: 'chart',
                kpiKey: 'repartition_charges',
                vizType: 'pie',
                config: { unit: '', description: '' },
                position: { x: 0, y: 7, w: 6, h: 4 },
            }
        );
        return widgets;
    }
};
