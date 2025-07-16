# Multi-stage build for DilSeDaan charity platform
FROM node:18-alpine AS base

# Install dependencies for building
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

# Install pnpm
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
FROM base AS frontend-builder
WORKDIR /app/apps/frontend
RUN pnpm build

# Build backend
FROM base AS backend-builder
WORKDIR /app/apps/backend
RUN pnpm build

# Production backend image
FROM node:18-alpine AS backend
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Install production dependencies
COPY apps/backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built backend
COPY --from=backend-builder --chown=backend:nodejs /app/apps/backend/dist ./dist
COPY --from=backend-builder --chown=backend:nodejs /app/apps/backend/src ./src

# Copy environment and configuration
COPY --chown=backend:nodejs .env.production .env

# Set up logs directory
RUN mkdir -p /app/logs && chown backend:nodejs /app/logs

USER backend

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]

# Production frontend image (nginx)
FROM nginx:alpine AS frontend
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates (if available)
# COPY ssl/ /etc/nginx/ssl/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

# Full stack development image
FROM base AS development
WORKDIR /app

# Install development tools
RUN apk add --no-cache git curl

# Copy built applications
COPY --from=frontend-builder /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=backend-builder /app/apps/backend/dist ./apps/backend/dist

# Expose ports
EXPOSE 3000 5000

# Development command
CMD ["pnpm", "dev"]
