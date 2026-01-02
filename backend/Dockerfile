# --- 1. Builder Stage ---
FROM node:20-slim AS builder

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
RUN npm rebuild

# Copy the rest of the application source code
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# --- 2. Pruner Stage ---
FROM node:20-slim AS pruner

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
RUN sed -i '/"postinstall": "npx prisma generate",/d' package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install only production dependencies
RUN npm ci --omit=dev

# --- 3. Final Production Stage ---
FROM node:20-slim

# Set NODE_ENV to production
ENV NODE_ENV=production

WORKDIR /app

# Copy the pruned node_modules from the pruner stage
COPY --from=pruner /app/node_modules ./node_modules

# Copy the generated prisma client from the builder stage (where prisma generate ran)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy the built application code from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the application source code (src) to the final stage for seeding/development tools
COPY src ./src

# Copy package.json, package-lock.json (from pruner stage)
# These are needed for runtime metadata, not for node_modules content now
COPY --from=pruner /app/package.json ./package.json
COPY --from=pruner /app/package-lock.json ./package-lock.json

# Copy schema.prisma
COPY prisma ./prisma

# Copy tsconfig.json to the final stage
COPY tsconfig.json .

# Explicitly set Prisma binary targets for the Debian environment
ENV PRISMA_BINARY_TARGETS="debian-openssl-3.0.x"

# Install OpenSSL for Prisma's runtime detection
RUN apt-get update -y && apt-get install -y openssl

# Run npm install and prisma generate in the final stage to ensure correct engine
RUN npm install --omit=dev --force # Reinstall production dependencies, force to avoid issues
RUN npx prisma generate

# The command to run the application
CMD ["node", "dist/core/index.js"]