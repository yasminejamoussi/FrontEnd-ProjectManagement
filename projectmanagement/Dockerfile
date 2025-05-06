# Use Node.js 18 as the base image
FROM node:18 AS builder

# Set the working directory
WORKDIR /src

# Copy only package files first (leverage caching)
COPY package*.json ./

# Clean npm cache and install ALL dependencies including devDependencies
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --include=dev --force

# Fix permissions for executable files in node_modules/.bin
RUN chmod -R +x /src/node_modules/.bin/

# Verify vite is installed
RUN npm list vite || echo "vite not found"

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the static files
FROM node:18
WORKDIR /src
RUN npm install -g serve
COPY --from=builder /src/build ./build
EXPOSE 80
CMD ["serve", "-s", "build", "-l", "80"]