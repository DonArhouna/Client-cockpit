# Page Finance & Trésorerie - Implémentation

## Vue d'ensemble
La page Finance & Trésorerie a été implémentée dans `src/features/cashflow/` en suivant la même architecture que la page Revenue Analysis.

## Structure des fichiers

```
src/features/cashflow/
├── TreasuryPage.tsx           # Page principale
├── TreasuryHeader.tsx          # En-tête avec titre et description
├── TreasuryFilters.tsx         # Filtres (période, comptes, actualisation)
├── TreasuryKpiGrid.tsx         # Grille de KPIs principaux
├── CashFlowChart.tsx           # Graphique d'évolution des flux
├── ReceivablesAnalysis.tsx     # Analyse de l'âge des créances (donut chart)
├── ClientRiskTable.tsx         # Tableau d'évaluation des risques clients
└── index.ts                    # Exports
```

## Composants implémentés

### 1. TreasuryHeader
- Titre: "Suivi de Trésorerie"
- Sous-titre: "Surveillance en temps réel des flux de trésorerie et gestion des créances"
- Icône: Dollar sign

### 2. TreasuryFilters
- Filtre de période (Vue Quotidienne, Hebdomadaire, Mensuelle)
- Filtre de comptes (Tous les comptes, Principal, Secondaire)
- Bouton Pause/Actualisation automatique
- Indicateur de dernière mise à jour
- Bouton Exporter

### 3. TreasuryKpiGrid
Affiche 4 KPIs principaux avec tendances:
- **Position de Trésorerie** (750 000 €, +12.5%)
- **Flux de Trésorerie Projeté** (125 000 €, +8.3%)
- **Days Sales Outstanding** (38 jours, -2 jours)
- **Créances en Retard** (89 000 €, -15.2%)

Plus 4 métriques secondaires:
- Comptes Surveillés: 12
- Alertes Actives: 3
- Prochaine Échéance: 2 jours
- Taux de Recouvrement: 94.2%

### 4. CashFlowChart
Graphique d'évolution avec 4 courbes:
- Flux Réel (bleu foncé)
- Flux Projeté (bleu clair, pointillé)
- Entrées (vert)
- Sorties (rouge)

Fonctionnalités:
- Boutons de vue (Quotidien, Hebdomadaire, Mensuel)
- Bouton Projections
- Tooltip interactif au survol
- Légende

### 5. ReceivablesAnalysis
Analyse de l'âge des créances avec:
- Donut chart central montrant le total (800 000 €)
- 4 tranches d'ancienneté:
  - 0-30 jours: 450 000 € (56.3%) - Risque Faible
  - 31-60 jours: 180 000 € (22.5%) - Risque Modéré
  - 61-90 jours: 95 000 € (11.9%) - Risque Élevé
  - 90+ jours: 75 000 € (9.4%) - Risque Critique

Actions:
- Filtrer par client
- Planifier relances
- Analyse des tendances

### 6. ClientRiskTable
Tableau d'évaluation des risques avec 6 clients:
- Groupe Industriel Marseille (Score: 85, Critique)
- Services Consulting Lyon (Score: 78, Élevé)
- TechnoLogistics SARL (Score: 65, Élevé)
- Distribution Nord-Est (Score: 42, Modéré)
- Société Générale Immobilier (Score: 25, Faible)
- Équipements Professionnels SA (Score: 18, Faible)

Colonnes:
- Client (nom + email)
- Montant Dû
- Limite de Crédit
- Score de Risque
- Statut Paiement (Échu, En retard, À temps)
- Dernier Paiement
- Actions (téléphone, email, calendrier)

## Intégration avec le backend

Les KPIs utilisent le hook `useKpiData` pour récupérer les données:
- `position_tresorerie`
- `flux_tresorerie_projete`
- `dso` (Days Sales Outstanding)
- `creances_retard`

Ces KPIs doivent être configurés dans le backend pour retourner:
```typescript
{
  current: number,    // Valeur actuelle
  previous: number,   // Valeur période précédente
  target: number,     // Objectif (optionnel)
  trend: number       // Tendance en %
}
```

## Route

La route `/finance` a été mise à jour dans `App.tsx` pour utiliser `TreasuryPage` au lieu de `GenericDashboardPage`.

## Personnalisation future

Pour permettre la personnalisation comme le dashboard:
1. Créer des widget templates pour chaque composant
2. Ajouter les KPIs dans le KPI Store
3. Utiliser `GenericDashboardPage` avec `pageId="finance"`
4. Les utilisateurs pourront alors ajouter/supprimer des widgets

## Design

L'implémentation suit fidèlement les maquettes fournies avec:
- Même palette de couleurs (bleu, vert, orange, rouge)
- Même disposition en grille
- Mêmes indicateurs visuels (badges, icônes, tendances)
- Même style de cartes et tableaux
