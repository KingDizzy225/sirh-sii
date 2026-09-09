// Configuration ESLint dédiée à la CI : les règles qui attrapent des erreurs
// d'exécution, et elles seules.
//
// Le lint complet du projet remonte encore beaucoup d'avertissements hérités ;
// les bloquer d'un coup arrêterait tous les déploiements. On ne verrouille donc
// que deux règles, choisies parce qu'elles détectent des pannes réelles que ni
// la vérification de syntaxe ni le build ne voient passer :
//
//   - « rules-of-hooks » : un hook appelé conditionnellement casse la page en
//     production (React #310) ;
//   - « no-undef » : une variable jamais déclarée passe la compilation et lève
//     « Can't find variable » au clic. C'est arrivé deux fois — un appel à `api`
//     dans un écran qui ne l'importe pas, et un garde portant sur une fonction
//     inexistante dans le mentorat. Le build ne résout pas les identifiants ;
//     cette règle, si.
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
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'no-undef': 'error',
    },
  },
]
