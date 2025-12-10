# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application (standalone mode creates .next/standalone directory)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV PORT=${PORT:-3000}
ENV HOSTNAME="0.0.0.0"

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output (includes server.js and .next/static)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy public folder (needed for static assets)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Cloud Run will set PORT automatically, but we expose 3000 as default
EXPOSE 3000

# Use the PORT environment variable that Cloud Run provides
CMD ["node", "server.js"]