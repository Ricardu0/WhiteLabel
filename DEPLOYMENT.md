# Documentação de Implantação do WhiteLabel na Azuree

Este documento descreve o processo de implantação da aplicação WhiteLabel em um único container na Azure usando Azure Container Apps.

## Arquitetura da Solução

A aplicação WhiteLabel é uma solução completa para gerenciamento de locação de veículos que inclui:

1. **Frontend**: Interface web responsiva desenvolvida com HTML, JavaScript e Bootstrap 5
2. **Backend**: API REST desenvolvida com Node.js e Express
3. **Banco de dados**: MySQL para armazenamento persistente dos dados

Toda a solução está configurada para ser executada em um único container Docker, ideal para implantação na Azure Container Apps.

## Pré-requisitos

- Uma conta na Azure com uma assinatura ativa
- Azure CLI instalado localmente
- Docker instalado localmente
- Git para clonar o repositório

## Estrutura do Repositório

```
WhiteLabel/
├── public/             # Arquivos estáticos e frontend
├── src/                # Código fonte do backend
├── Dockerfile          # Configuração para construção da imagem Docker
├── package.json        # Dependências do projeto
└── .env.example        # Exemplo de variáveis de ambiente
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` com as seguintes variáveis:

```
NODE_ENV=production
PORT=3000
DB_HOST=<seu-host-mysql>
DB_USER=<seu-usuario-mysql>
DB_PASS=<sua-senha-mysql>
DB_NAME=<nome-do-banco>
DB_PORT=3306
```

## Construção da Imagem Docker

1. Clone o repositório:
   ```bash
   git clone https://github.com/Ricardu0/WhiteLabel.git
   cd WhiteLabel
   ```

2. Construa a imagem Docker:
   ```bash
   docker build -t whitelabel:latest .
   ```

3. Teste a imagem localmente:
   ```bash
   docker run -p 3000:3000 --env-file .env whitelabel:latest
   ```

## Implantação na Azure Container Apps

### Método 1: Usando Portal Azure

1. Acesse o [Portal Azure](https://portal.azure.com)
2. Crie um novo recurso "Azure Container Apps"
3. Configure os detalhes básicos:
   - Nome do aplicativo: `whitelabel`
   - Grupo de recursos: crie um novo ou use existente
   - Região: escolha a mais próxima
4. Na seção de imagem do contêiner, especifique:
   - Fonte da imagem: Azure Container Registry ou Docker Hub
   - Nome da imagem: `whitelabel:latest`
5. Configure as variáveis de ambiente usando os valores do arquivo `.env`
6. Finalize a criação do recurso

### Método 2: Usando Azure CLI

1. Faça login no Azure CLI:
   ```bash
   az login
   ```

2. Crie um grupo de recursos:
   ```bash
   az group create --name whitelabel-rg --location eastus
   ```

3. Crie um Azure Container Registry:
   ```bash
   az acr create --resource-group whitelabel-rg --name whitelabelacr --sku Basic
   az acr login --name whitelabelacr
   ```

4. Faça tag e envie a imagem para o registry:
   ```bash
   docker tag whitelabel:latest whitelabelacr.azurecr.io/whitelabel:latest
   docker push whitelabelacr.azurecr.io/whitelabel:latest
   ```

5. Crie o ambiente de Container Apps:
   ```bash
   az containerapp env create \
     --name whitelabel-env \
     --resource-group whitelabel-rg \
     --location eastus
   ```

6. Implante o contêiner:
   ```bash
   az containerapp create \
     --name whitelabel \
     --resource-group whitelabel-rg \
     --environment whitelabel-env \
     --image whitelabelacr.azurecr.io/whitelabel:latest \
     --registry-server whitelabelacr.azurecr.io \
     --target-port 3000 \
     --ingress external \
     --env-vars DB_HOST=<seu-host-mysql> DB_USER=<seu-usuario> DB_PASS=<sua-senha> DB_NAME=<nome-do-banco>
   ```

## Configuração do Banco de Dados

Para produção na Azure, recomendamos usar o Azure Database for MySQL:

1. Crie um recurso "Azure Database for MySQL"
2. Configure o firewall para permitir acesso do Container App
3. Atualize as variáveis de ambiente do Container App com as credenciais do banco

## Monitoramento e Logs

1. Acesse os logs do container:
   ```bash
   az containerapp logs show --name whitelabel --resource-group whitelabel-rg
   ```

2. Configure Application Insights para monitoramento avançado:
   ```bash
   az monitor app-insights component create \
     --app whitelabel-insights \
     --location eastus \
     --resource-group whitelabel-rg
   ```

## Suporte e Manutenção

Para atualizar a aplicação:

1. Construa uma nova versão da imagem:
   ```bash
   docker build -t whitelabelacr.azurecr.io/whitelabel:v2 .
   docker push whitelabelacr.azurecr.io/whitelabel:v2
   ```

2. Atualize o Container App:
   ```bash
   az containerapp update \
     --name whitelabel \
     --resource-group whitelabel-rg \
     --image whitelabelacr.azurecr.io/whitelabel:v2
   ```

## Solução de Problemas

- **Problema de Conexão ao Banco**: Verifique as variáveis de ambiente e regras de firewall
- **Falhas de Inicialização**: Consulte os logs do container para identificar erros
- **Problemas de Performance**: Aumente os recursos alocados para o Container App

## Conclusão

Esta documentação fornece os passos necessários para implantar a aplicação WhiteLabel em um único container na Azure Container Apps. A configuração é otimizada para ambientes de produção, com resiliência a falhas e capacidade de escalonamento.