# backend/Dockerfile

# --- 1. Builder Stage ---
# This stage installs all dependencies (including devDependencies) and builds the application.
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Set NODE_ENV to development to ensure devDependencies are installed
ENV NODE_ENV=development

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./
COPY prisma ./prisma

# Install all dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# --- 2. Pruner Stage ---
# This stage removes devDependencies to create a clean production node_modules directory.
FROM node:20-alpine AS pruner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# --- 3. Final Production Stage ---
# This stage creates the final, lean production image.
FROM node:20-alpine

# Set NODE_ENV to production
ENV NODE_ENV=production

WORKDIR /app

# Copy the pruned node_modules from the pruner stage
COPY --from=pruner /app/node_modules ./node_modules

# Copy the generated prisma client from the builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy the built application code from the builder stage
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY package.json .
COPY prisma ./prisma

# The command to run the application
CMD ["node", "dist/core/index.js"]