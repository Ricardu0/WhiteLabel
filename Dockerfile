FROM node:20-alpine

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm ci --only=production

# Copiar o restante do código
COPY . .

# Configuração de variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Expor porta da aplicação
EXPOSE 3000

# Healthcheck para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s \
  CMD node -e "fetch('http://localhost:3000/test').then(res => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

# Comando para iniciar a aplicação
CMD ["npm", "start"]
