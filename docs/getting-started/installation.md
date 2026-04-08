# Installation

## Prérequis

Avant d'installer le projet, assurez-vous d'avoir les outils suivants :

| Outil | Version minimale | Vérification |
|-------|-----------------|--------------|
| **Node.js** | 18+ | `node --version` |
| **Yarn** | 1.22+ | `yarn --version` |
| **Backend NestJS** | En cours d'exécution | `http://localhost:3000` |

---

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-depot>
cd Cockpit/client-cockpit
```

### 2. Installer les dépendances

```bash
yarn install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` selon votre environnement (voir [Configuration](configuration.md)).

---

## Lancement

=== "Développement"

    ```bash
    yarn dev
    ```

    L'application sera disponible sur **[http://localhost:5173](http://localhost:5173)**

=== "Build production"

    ```bash
    yarn build
    ```

=== "Prévisualisation du build"

    ```bash
    yarn preview
    ```

---

## Vérification

Une fois lancé, vous devriez voir la page de connexion à `http://localhost:5173/login`.

!!! tip "Première connexion"
    Si vous avez un compte superadmin, vous pouvez bypasser l'onboarding.
    Pour les nouveaux comptes, l'**onboarding** est obligatoire avant d'accéder à l'application.

---

## Résolution de problèmes courants

??? question "Le backend ne répond pas"
    Vérifiez que le backend NestJS est bien démarré sur le port 3000.
    ```bash
    curl http://localhost:3000/api/health
    ```

??? question "Erreur de dépendances"
    Supprimez `node_modules` et réinstallez :
    ```bash
    rm -rf node_modules
    yarn install
    ```

??? question "Port déjà utilisé"
    Vite utilise le port 5173 par défaut. Vous pouvez le changer dans `vite.config.ts`.
