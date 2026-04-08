# Trésorerie & Finance

**Route :** `/finance`  
**Composant :** `src/features/cashflow/TreasuryPage.tsx`

---

## Description

Le module **Trésorerie** permet de suivre en temps réel les flux financiers de l'organisation : solde disponible, flux entrants/sortants et couverture de liquidité.

---

## Insight IA

L'indicateur clé est calculé automatiquement depuis deux KPIs :

| KPI | Clé API | Description |
|-----|---------|-------------|
| Solde de trésorerie | `solde_tresorerie` | Montant disponible |
| Taux de couverture | `taux_couverture_flux` | Flux entrants vs sortants (%) |

**Logique d'alerte :**

```
Taux ≥ 100%  → 🟢 Succès  — Aucune tension de liquidité
Taux ≥ 80%   → 🟡 Warning — Attention particulière requise
Taux < 80%   → 🔴 Danger  — Alerte liquidité
```

---

## Filtres disponibles

- **Période** : Ce mois / Ce trimestre / Cette année
- **Devise** : XOF / EUR / USD

---

## Widgets par défaut

Les widgets sont auto-populés depuis `PAGE_DEFAULT_WIDGETS['finance']` :

- KPI Cards financiers
- Graphique d'évolution de la trésorerie
- Tableau des flux

---

## Personnalisation

```tsx
// Clé de page : 'finance'
const widgets = layouts['finance'] || [];

// Domaine de widgets autorisé
<WidgetSidebar allowedDomains={['finance']} />
```

---

## Composants internes

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `TreasuryHeader` | `cashflow/` | En-tête avec bouton édition |
| `TreasuryFilters` | `cashflow/` | Filtres spécifiques trésorerie |
