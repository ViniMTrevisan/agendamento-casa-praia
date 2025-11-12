# --- 1. Estágio de Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Declara o argumento que o compose vai passar
ARG DATABASE_URL

COPY package*.json ./

RUN npm install

COPY . .

# Define o ARG como uma ENV para o 'npm run build' o ler
ENV DATABASE_URL=$DATABASE_URL

# (A ENV placeholder antiga foi removida)

# Corre o build (que corre 'prisma generate' e 'next build')
RUN npm run build

# --- 2. Estágio de Produção (Runner) ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# (Copia o Prisma Client gerado)
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
# (Copia o schema, necessário para o runtime)
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "server.js"]