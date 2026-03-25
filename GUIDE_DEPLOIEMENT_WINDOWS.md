# Guide de Déploiement : SIRH-SII sur Serveur Windows

Ce guide technique s'adresse à l'équipe informatique en charge du déploiement de l'application SIRH-SII (Node.js / React Vite / SQLite) sur un environnement **Windows Server On-Premise**.

## 1. Prérequis sur le Serveur Windows

Assurez-vous que les éléments suivants sont installés sur la machine cible :
- **Node.js** (version LTS recommandée, ex: v20+). (Vérifier via `node -v`)
- **IIS (Internet Information Services)** activé via le Gestionnaire de serveur.
- Les modules IIS suivants :
  - **URL Rewrite** (Module de réécriture d'URL).
  - **Application Request Routing (ARR)** (Activé en tant que proxy).
- **Git** (Optionnel, si vous clonez directement le code depuis le dépôt).

## 2. Préparation de l'Application (Côté Développeur)

Avant de copier les fichiers sur le serveur, vous devez "compiler" (build) l'interface frontend depuis votre machine de développement.

1. Ouvrez un terminal dans le dossier principal `SIRH-SII`.
2. Lancez la compilation :
```bash
npm run build
```
> *Résultat : Un nouveau dossier `dist` est généré. Il contient la version optimisée et statique de votre application web.*

## 3. Mise en place sur le Serveur Windows

### A. Le Backend (L'API Node.js)
1. Créez un dossier cible pour le backend, par exemple : `C:\inetpub\sirh-api\`
2. Copiez l'intégralité du contenu du sous-dossier `server/` (incluant `index.js`, `.env`, `package.json`, et le sous-dossier `prisma`, incluant `dev.db`) dans `C:\inetpub\sirh-api\`.
3. Ouvrez un terminal administrateur dans ce dossier et installez les dépendances propres au serveur :
```bash
npm install
```
4. Pour faire tourner le serveur 24h/24 en tant que service Windows, installez **PM2** :
```bash
npm install -g pm2
npm install -g pm2-windows-service
```
5. Lancez l'API SIRH via PM2 :
```bash
pm2 start index.js --name "sirh-api"
pm2 save
```
> *Le backend écoute désormais sur le port `3000` (ou le port défini dans le `.env`).*

### B. Le Frontend (Interface React)
1. Créez un dossier pour le site web, par exemple : `C:\inetpub\wwwroot\sirh-frontend\`
2. Copiez tout le contenu de votre dossier `dist` (généré à l'étape 2) vers ce nouveau dossier cible.

## 4. Configuration d'IIS (Reverse Proxy)

Il faut lier le port web standard (80 ou 443) à votre dossier Frontend, et rediriger automatiquement les requêtes qui concernent les données vers votre Backend (Port 3000).

1. Ouvrez le **Gestionnaire IIS**.
2. Ajoutez un nouveau **Site Web** (Nom: *SIRH*, Chemin physique: `C:\inetpub\wwwroot\sirh-frontend`, Port: 80).
3. À la racine du dossier `sirh-frontend`, créez un fichier `web.config` si votre application utilise un routeur (React Router) :

```xml
<?xml version="1.0"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Règle 1: Rediriger les requêtes API vers le backend Node.js (Port 3000) -->
        <rule name="Reverse Proxy to API" stopProcessing="true">
            <match url="^api/(.*)" />
            <action type="Rewrite" url="http://127.0.0.1:3000/api/{R:1}" />
        </rule>
        <!-- Règle 2: Rediriger toutes les autres requêtes vers index.html pour React Router -->
        <rule name="React Router Fallback" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## 5. Vérification Finale
- Ouvrez un navigateur sur le serveur ou sur un poste relié au réseau de l'entreprise.
- Entrez l'adresse IP du serveur Windows (ex: `http://192.168.1.100`).
- L'interface devrait s'afficher correctement.
- Essayez de vous connecter. Si la connexion réussit, cela confirme que la redirection (`/api/`) vers le Backend (PM2) fonctionne à merveille.

--- 
*Note de Sécurité : Assurez-vous d'ouvrir/autoriser les ports appropriés dans le Pare-feu Windows Defender.*
