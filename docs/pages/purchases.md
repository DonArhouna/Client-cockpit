# Achats & Performance Opérationnelle

**Route :** `/purchases`  
**Composant :** `src/features/operational/OperationalPerformancePage.tsx`

---

## Description

Le module **Achats** suit la performance opérationnelle de l'organisation : efficacité des processus, gestion des fournisseurs et suivi des achats.

---

## Insight IA

| KPI | Clé API | Description |
|-----|---------|-------------|
| Taux d'efficacité opérationnelle | `taux_efficacite_ops` | Performance globale (%) |

**Logique d'alerte :**

```
Taux > 85%  → 🟢 Succès
Taux > 70%  → 🟡 Warning
Taux ≤ 70%  → 🔴 Danger
```

---

## Composants internes

| Composant | Rôle |
|-----------|------|
| `OperationalHeader` | En-tête avec actions |
| `OperationalFilters` | Filtres opérationnels |

---

## Personnalisation

```tsx
// Clé de page : 'operational'
const widgets = layouts['operational'] || [];

<WidgetSidebar allowedDomains={['purchases']} />
```
