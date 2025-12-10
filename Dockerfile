# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL
ARG CLERK_SECRET_KEY

# Set build-time environment variables
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output (includes server.js and .next/static)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy public folder (needed for static assets like images, favicon, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Note: Environment variables (CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, etc.)
# should be set when deploying to Cloud Run, not in the Dockerfile.
# They will be available at runtime to the Next.js application.

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]