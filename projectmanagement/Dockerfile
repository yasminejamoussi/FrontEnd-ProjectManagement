# Use Node.js 18 as the base image
FROM node:18 AS builder

# Set the working directory
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# Verify vite is installed
RUN npm list vite || echo "vite not found"

# Copy the rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Étape 2 : Servir les fichiers statiques
FROM node:18
WORKDIR /src
RUN npm install -g serve
COPY --from=builder /src/build ./build
EXPOSE 80
CMD ["serve", "-s", "build", "-l", "80"]