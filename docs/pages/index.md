# Pages & Modules

Cockpit propose **8 modules analytiques** accessibles depuis la navigation latérale.

| Module | Route | Description |
|--------|-------|-------------|
| [Dashboard](dashboard.md) | `/dashboard` | Tableau de bord exécutif personnalisable |
| [Trésorerie](finance.md) | `/finance` | Suivi des flux de trésorerie |
| [Ventes](sales.md) | `/sales` | Analyse du chiffre d'affaires |
| [Achats](purchases.md) | `/purchases` | Performance opérationnelle |
| [Stocks](stocks.md) | `/stocks` | Inventaire et ruptures |
| [Comptabilité](accounting.md) | `/accounting` | Bilans et résultats |
| [Risques](risks.md) | `/risks` | Recouvrement et clients à risque |
| [Requêtes IA](smart-queries.md) | `/smart-queries` | Questions en langage naturel |

---

## Fonctionnalités communes

Tous les modules analytiques partagent les mêmes fonctionnalités :

### Filtres globaux

- **Période** : Ce mois / Ce trimestre / Cette année
- **Devise** : XOF / EUR / USD

Ces filtres sont synchronisés entre toutes les pages via le `FilterContext`.

### Insight IA

Chaque page affiche un **indicateur clé** généré automatiquement depuis les données réelles :

```
🟢 Vert    → Performance bonne
🟡 Orange  → Attention requise
🔴 Rouge   → Alerte critique
```

### Grille de widgets personnalisable

Chaque page dispose d'une grille **drag & drop** configurable :

1. Cliquer sur **✏️ Éditer** dans le header
2. Le panneau latéral s'ouvre avec les widgets disponibles
3. Glisser-déposer les widgets sur la grille
4. Redimensionner en tirant les coins
5. Cliquer sur **✅ Terminer** pour sauvegarder

### Barre de recherche IA

Une barre de **recherche en langage naturel** est disponible sur chaque page pour interroger les données du module.
