# Use Node.js 18 as the base image
FROM node:18 AS builder

# Set the working directory
WORKDIR /src

# Copy package.json and package-lock.json from the projectmanagement subdirectory
COPY projectmanagement/package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend code
COPY projectmanagement/ .

# Build the React app
RUN npm run build

# Étape 2 : Servir les fichiers statiques
FROM node:18
WORKDIR /src
RUN npm install -g serve
COPY --from=builder /src/build ./build
EXPOSE 80
CMD ["serve", "-s", "build", "-l", "80"]