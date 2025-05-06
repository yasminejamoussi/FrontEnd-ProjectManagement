# Étape 1 : Build
FROM node:18 AS builder
WORKDIR /src

# Copier package.json et package-lock.json pour le caching
COPY package*.json ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le reste des fichiers
COPY . .

# Installer vite, appliquer les permissions, puis vérifier la version
RUN npm install vite --save-dev && \
    chmod +x node_modules/.bin/vite && \
    npx vite --version

# Construire l'application
RUN npm run build

# Étape 2 : Servir les fichiers statiques
FROM node:18
WORKDIR /src
RUN npm install -g serve
COPY --from=builder /src/dist ./dist
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]