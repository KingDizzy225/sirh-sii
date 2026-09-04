// Configuration ESLint dédiée à la CI : uniquement les règles des hooks React.
//
// Le lint complet du projet remonte encore beaucoup d'avertissements hérités ;
// les bloquer d'un coup arrêterait tous les déploiements. On ne verrouille donc
// que « rules-of-hooks », qui détecte des erreurs d'exécution réelles — un hook
// appelé conditionnellement casse la page en production (React #310), sans que
// la vérification de syntaxe ni le build ne s'en aperçoivent.
//
// Le lint complet reste disponible via `npm run lint`.

import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['dist', 'cypress', 'server'] },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
    },
  },
]
