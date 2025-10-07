FROM node:20

# Criar diretório de trabalho, caso queira rodar no webapp, ou no acr/aci
WORKDIR /home/site/wwwroot

# Copiar arquivos de dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm ci --only=production

# Copiar o restante do código
COPY . .

# Configuração de variáveis de ambiente
ENV NODE_ENV=production
# Azure Web App define automaticamente a porta em WEBSITES_PORT e PORT
# Configuramos um valor padrão de 8080 para desenvolvimento
ENV PORT=8080

# Expor porta da aplicação - Azure Web App usa porta 8080 ou a definida em WEBSITES_PORT
EXPOSE 8080

# Healthcheck para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s \
  CMD node -e "fetch('http://localhost:' + process.env.PORT + '/test').then(res => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

# Script de inicialização específico para o Azure
COPY ./startup.sh /
RUN chmod +x /startup.sh

# Comando para iniciar a aplicação
CMD ["/startup.sh"]
