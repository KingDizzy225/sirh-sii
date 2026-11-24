# ==============================================================================
# SIRH-SII — Multi-Stage Production Dockerfile
# Optimisé pour déploiement d'Entreprise Sécurisé (CI/CD, Cloud, On-Premise)
# ==============================================================================

# Étape 1 : Build du Frontend Vite React
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copie des manifests de dépendances frontend
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copie des sources frontend et build de production
COPY . .
RUN npm run build

# Étape 2 : Préparation du Backend Express & Prisma
FROM node:20-alpine AS backend-builder
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci

COPY server/ ./
RUN npx prisma generate

# Étape 3 : Image Finale Légère de Production
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Installation d'outils de santé et curl
RUN apk add --no-cache curl bash

# Copie du backend prêt à l'emploi
COPY --from=backend-builder /app/server /app/server

# Copie des fichiers statiques frontend compilés dans le dossier public du serveur
COPY --from=frontend-builder /app/dist /app/server/public

WORKDIR /app/server

EXPOSE 3000

# Healthcheck de conformité conteneur
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "index.js"]
