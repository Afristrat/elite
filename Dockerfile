# ─── Stage 1 : Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les dépendances (npm ci utilise package-lock.json)
COPY package.json package-lock.json ./
RUN npm ci

# Copier les sources
COPY . .

# Variables de build (publiques uniquement — les secrets sont injectés au runtime)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build Next.js en mode standalone
RUN npm run build

# ─── Stage 2 : Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Outils système (wget requis pour le healthcheck Coolify)
RUN apk add --no-cache wget

# Utilisateur non-root pour sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier uniquement les artefacts nécessaires (mode standalone)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Healthcheck géré par Coolify (HTTP healthcheck configuré dans l'UI)
# Le HEALTHCHECK Docker est volontairement absent pour éviter les conflits

CMD ["node", "server.js"]
