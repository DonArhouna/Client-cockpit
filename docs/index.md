# Bienvenue sur la documentation de Cockpit

<div class="grid cards" markdown>

-   :material-speedometer: **Tableau de bord exécutif**

    ---

    Dashboard configurable avec widgets dynamiques, KPIs en temps réel et insights IA.

    [:octicons-arrow-right-24: En savoir plus](pages/dashboard.md)

-   :material-robot: **Requêtes Intelligentes**

    ---

    Posez vos questions en langage naturel et obtenez des visualisations instantanées.

    [:octicons-arrow-right-24: En savoir plus](pages/smart-queries.md)

-   :material-chart-line: **Modules Analytiques**

    ---

    Finance, Ventes, Achats, Stocks, Comptabilité et Risques — tout en un seul endroit.

    [:octicons-arrow-right-24: Voir les modules](pages/index.md)

-   :material-cog: **Guide de développement**

    ---

    Conventions, architecture et tutoriels pour contribuer au projet.

    [:octicons-arrow-right-24: Commencer](development/guide.md)

</div>

---

## Présentation

**Cockpit** est une plateforme d'intelligence décisionnelle (BI) conçue pour les entreprises souhaitant piloter leurs activités en temps réel.

L'application **client-cockpit** est l'interface utilisée par les clients finaux. Elle permet de :

- 📊 Visualiser les KPIs financiers et opérationnels
- 🤖 Interroger les données en langage naturel (NLP)
- 🎨 Personnaliser les tableaux de bord par drag & drop
- ⚙️ Gérer les utilisateurs, collaborateurs et paramètres
- 🔔 Recevoir des alertes et insights générés par l'IA

---

## Stack technique

| Technologie | Usage |
|-------------|-------|
| **React 18** | Framework UI |
| **TypeScript** | Typage statique |
| **Vite** | Build tool |
| **TailwindCSS** | Styling |
| **shadcn/ui** | Composants UI |
| **React Router v7** | Routage |
| **TanStack Query** | Data fetching & cache |
| **i18next** | Internationalisation FR/EN |
| **Axios** | Client HTTP (intercepteurs JWT) |
| **Recharts** | Graphiques |
| **React Grid Layout** | Grille de widgets drag & drop |

---

## Structure du projet

```
client-cockpit/
├── src/
│   ├── api/           # Client API Axios + endpoints
│   ├── components/    # Composants partagés et layout
│   ├── context/       # Contextes React (Auth, Filter, Dashboard)
│   ├── features/      # Modules fonctionnels (une page = un dossier)
│   ├── hooks/         # Custom hooks React
│   ├── i18n/          # Traductions FR/EN
│   ├── lib/           # Utilitaires
│   └── types/         # Types TypeScript
├── docs/              # Cette documentation
└── mkdocs.yml         # Configuration MkDocs
```

---

## Navigation rapide

- 🗺️ [Cartographie web](cartographie.md) — Toutes les pages et routes
- 🚀 [Installation](getting-started/installation.md) — Démarrer en local
- 🏗️ [Architecture](architecture/overview.md) — Comprendre la structure
- 📄 [Pages & Modules](pages/index.md) — Documentation des pages
- 🔧 [Guide de développement](development/guide.md) — Contribuer au projet
