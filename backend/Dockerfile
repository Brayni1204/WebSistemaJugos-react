# backend/Dockerfile

# --- 1. Build Stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code
RUN npm run build

# --- 2. Production Stage ---
FROM node:20-alpine

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/start.js ./start.js

# Expose the port the app runs on
EXPOSE 5000

# The command to run the application
CMD ["npm", "start"]
