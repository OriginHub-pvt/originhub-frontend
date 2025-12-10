# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Accept build arguments for NEXT_PUBLIC_* variables (required at build time)
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL

# Set build-time environment variables
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the rest of the application
COPY . .

# Build the application (standalone mode creates .next/standalone directory)
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output (includes server.js and .next/static)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy public folder (needed for static assets)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Note: CLERK_SECRET_KEY should be set in Cloud Run environment variables at runtime

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]