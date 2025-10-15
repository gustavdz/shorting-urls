# Stage 1: Base dependencies
FROM node:22-alpine AS base
WORKDIR /app

# Copy package files and Node.js version specification
COPY package.json package-lock.json .nvmrc ./
COPY prisma ./prisma/

# Stage 2: Production dependencies
FROM base AS deps
# Install production dependencies only
RUN npm ci --only=production --frozen-lockfile

# Stage 3: Build dependencies and application
FROM base AS builder
# Install all dependencies (including dev)
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 4: Runtime
FROM node:22-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy built application and configuration files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/.nvmrc ./

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["npm", "start"]
