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
RUN npm rebuild

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

COPY --from=builder /app/package.json ./package.json
RUN sed -i '/"postinstall": "npx prisma generate",/d' package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

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

# Copy package.json, package-lock.json (from pruner stage)
COPY --from=pruner /app/package.json ./package.json
COPY --from=pruner /app/package-lock.json ./package-lock.json

# Copy schema.prisma
COPY prisma ./prisma

# Generate Prisma client in the final stage to ensure correct engine for runtime
RUN npx prisma generate

# The command to run the application
CMD ["node", "dist/core/index.js"]