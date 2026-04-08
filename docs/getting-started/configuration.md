# Configuration

## Variables d'environnement

Le fichier `.env` (copié depuis `.env.example`) contient les variables de configuration :

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:3000/api` |

---

## Exemple de fichier `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

!!! warning "Production"
    En production, remplacez `localhost:3000` par l'URL de votre backend déployé.

---

## Configuration Vite

Le fichier `vite.config.ts` configure le build tool :

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

L'alias `@` permet d'importer depuis la racine `src/` :

```tsx
// Au lieu de : import { Button } from '../../components/ui/button'
import { Button } from '@/components/ui/button'
```

---

## Configuration TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Thème et apparence

Le thème (dark/light) est géré par `ThemeProvider` et persisté en `localStorage`.

- **Par défaut** : Suit le thème système de l'utilisateur
- **Changement** : Via le bouton dans le header
- **Persistance** : Sauvegardé automatiquement

---

## Internationalisation

- **Langue par défaut** : Français
- **Langues disponibles** : Français, Anglais
- **Changement** : Via le sélecteur dans le header
- **Fichiers** : `src/i18n/fr.ts` et `src/i18n/en.ts`
