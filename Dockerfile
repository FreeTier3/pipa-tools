
# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências para build
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

# Instalar dumb-init para manejo correto de sinais
RUN apk add --no-cache dumb-init wget

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências necessárias para produção (incluindo express)
RUN npm ci --omit=dev && npm install express && npm cache clean --force

# Copiar build da aplicação do estágio anterior
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/server ./server

# Criar diretório para banco de dados
RUN mkdir -p /app/database && chown nextjs:nodejs /app/database

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Comando para iniciar aplicação
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.cjs"]
