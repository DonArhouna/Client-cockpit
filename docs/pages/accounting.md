# Comptabilité

**Route :** `/accounting`  
**Composant :** `src/features/accounting/AccountingPage.tsx`

---

## Description

Le module **Comptabilité** présente les bilans, résultats comptables et écarts budgétaires de l'organisation.

---

## Insight IA

| KPI | Clé API | Description |
|-----|---------|-------------|
| Résultat comptable | `resultat_comptable` | Résultat du mois courant |
| Écart budgétaire | `ecart_budgetaire` | Écart par rapport au budget (%) |

**Logique d'alerte :**

```
Écart < 5%   → 🟢 Succès
Écart ≤ 10%  → 🟡 Warning
Écart > 10%  → 🔴 Danger
```

---

## Composants internes

| Composant | Rôle |
|-----------|------|
| `AccountingHeader` | En-tête avec actions |
| `AccountingFilters` | Filtres comptables |

---

## Personnalisation

```tsx
// Clé de page : 'accounting'
const widgets = layouts['accounting'] || [];

<WidgetSidebar allowedDomains={['accounting']} />
```
