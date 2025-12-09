# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build (NEXT_PUBLIC_* must be here!)
FROM node:20-alpine AS builder
WORKDIR /app

# Inject build-time env vars
ENV NEXT_PUBLIC_API_URL="http://backend-service"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js with correct environment variables
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# These runtime envs DO NOT influence frontend JS (only backend functions)
ENV NEXT_PUBLIC_API_URL="http://backend-service"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]