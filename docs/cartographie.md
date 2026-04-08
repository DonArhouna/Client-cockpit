# Cartographie Web — Client Cockpit

> Inventaire complet de toutes les pages, routes et fonctionnalités de l'application **client-cockpit**.  
> **Dernière mise à jour :** Avril 2026  
> **Statut :** 🛠️ En Développement

---

## Vue d'ensemble

```
32 routes   ·   5 pages publiques   ·   7 modules analytiques   ·   6 pages admin
```

---

## 🔓 Pages Publiques (non authentifiées)

| Page | URL | Description |
|------|-----|-------------|
| Connexion | `/login` | Formulaire de connexion email + mot de passe |
| Inscription | `/register` | Création d'un nouveau compte |
| Mot de passe oublié | `/forgot-password` | Demande de réinitialisation par email |
| Réinitialisation MDP | `/reset-password` | Formulaire de définition d'un nouveau mot de passe |
| Acceptation d'invitation | `/accept-invitation` | Accueil des collaborateurs invités |

---

## 🚀 Onboarding (authentifié, hors layout)

| Page | URL | Description |
|------|-----|-------------|
| Configuration initiale | `/onboarding` | Étape obligatoire pour les nouveaux clients |

!!! info "Note"
    Les superadmins contournent automatiquement l'onboarding.

---

## 📱 Application Principale

### 🏠 Accueil

| Page | URL | Fonctionnalités clés |
|------|-----|----------------------|
| Dashboard Exécutif | `/dashboard` | Grille de widgets, filtres période/devise, insight IA, bandeau alertes |

---

### 📈 Analytique & Finance

| Page | URL | KPI Insight IA |
|------|-----|----------------|
| Trésorerie | `/finance` | Solde disponible + taux de couverture flux |
| Analyse des Ventes | `/sales` | Progression du CA et segments clés |
| Achats & Opérationnel | `/purchases` | Taux d'efficacité opérationnelle |
| Stocks & Inventaire | `/stocks` | Articles en rupture de stock critique |
| Comptabilité | `/accounting` | Résultat comptable et écart budgétaire |
| Risques & Recouvrement | `/risks` | Montant exposé et clients en risque élevé |

!!! tip "Fonctionnalité commune"
    Chaque module analytique dispose d'un **mode édition** permettant de personnaliser la grille de widgets (ajout, suppression, drag & drop).

---

### 🤖 Intelligence Artificielle

| Page | URL | États |
|------|-----|-------|
| Requêtes Intelligentes | `/smart-queries` | Initial · Traitement (4 étapes) · Résultat |

---

### 🎨 Personnalisation

| Page | URL | Description |
|------|-----|-------------|
| Personnalisation | `/personalization` | Thèmes et préférences visuelles |
| KPI Store | `/kpi-store` | Catalogue de widgets disponibles |
| → Détail template | `/kpi-store/widget-templates/:id` | Fiche détail d'un widget |

---

### ⚙️ Paramètres

| Page / Onglet | URL | Statut |
|---------------|-----|--------|
| Paramètres | `/settings` | — |
| ↳ Profil | `/settings` → onglet Profil | ✅ Actif |
| ↳ Collaborateurs | `/settings` → onglet Collaborateurs | ✅ Actif |
| ↳ Sécurité | `/settings` → onglet Sécurité | ⏳ À venir |
| ↳ Notifications | `/settings` → onglet Notifications | ⏳ À venir |
| Profil | `/profile` | ✅ Actif |

---

### 🏢 Administration

| Page | URL |
|------|-----|
| Organisations | `/organizations` |
| → Détail organisation | `/organizations/:id` |
| Utilisateurs | `/users` |
| → Détail utilisateur | `/users/:id` |
| Invitations | `/invitations` |
| Rôles & Permissions | `/roles` |
| → Détail rôle | `/roles/:id` |
| Agents IA | `/agents` |
| → Détail agent | `/agents/:id` |
| Journaux d'audit | `/audit-logs` |
| Santé système | `/health` |

---

### 💳 Abonnements

| Page | URL |
|------|-----|
| Plans d'abonnement | `/subscription-plans` |
| → Détail plan | `/subscription-plans/:id` |
| Plans clients | `/client-plans` |

---

## Arborescence complète

```
client-cockpit
│
├── 🔓 Authentification
│   ├── /login
│   ├── /register
│   ├── /forgot-password
│   ├── /reset-password
│   └── /accept-invitation
│
├── 🚀 /onboarding
│
└── 📱 Application principale
    ├── /dashboard
    ├── /finance
    ├── /sales  (/revenue-analysis → redirect)
    ├── /purchases
    ├── /stocks
    ├── /accounting
    ├── /risks
    ├── /smart-queries
    ├── /personalization
    ├── /kpi-store
    │   └── /kpi-store/widget-templates/:id
    ├── /settings  (onglets: Profil, Collaborateurs, Sécurité*, Notifs*)
    ├── /profile
    ├── /organizations + /:id
    ├── /users + /:id
    ├── /invitations
    ├── /roles + /:id
    ├── /agents + /:id
    ├── /audit-logs
    ├── /health
    ├── /subscription-plans + /:id
    └── /client-plans
```

*⏳ = à venir*
