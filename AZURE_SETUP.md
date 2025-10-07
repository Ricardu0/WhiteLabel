# Criando e Configurando Azure Container Registry (ACR) - do modo basico

Este documento explica como criar e configurar um Azure Container Registry (ACR) antes de fazer o deploy do seu aplicativo WhiteLabel para a Azure.

## 1. Criar o Azure Container Registry

### Usando o Azure CLI

```powershell
# Login na sua conta Azure
az login

# Criar um grupo de recursos (se ainda não tiver um)
az group create --name whitelabel-rg --location eastus

# Criar um Azure Container Registry
az acr create --resource-group whitelabel-rg --name whitelabelacr --sku Basic
```

### Usando o Portal Azure

1. Acesse o [Portal Azure](https://portal.azure.com)
2. Clique em "Create a resource"
3. Pesquise por "Container Registry"
4. Preencha os detalhes:
   - Subscription: Sua assinatura Azure
   - Resource Group: `whitelabel-rg` (crie um novo se necessário)
   - Registry name: `whitelabelacr`
   - Location: Escolha a região mais próxima de você
   - SKU: Basic
5. Clique em "Review + create" e depois "Create"

## 2. Habilitar o acesso ao ACR

Por padrão, você precisa autenticar-se para usar o ACR. Para simplificar, você pode habilitar o usuário Admin:

```powershell
# Habilitar usuário Admin no ACR
az acr update --name whitelabelacr --resource-group whitelabel-rg --admin-enabled true
```

## 3. Obter as credenciais do ACR

```powershell
# Obter o servidor de login
az acr show --name whitelabelacr --resource-group whitelabel-rg --query loginServer --output tsv

# Obter o nome de usuário e senha (com Admin habilitado)
az acr credential show --name whitelabelacr --resource-group whitelabel-rg
```

## 4. Criar um Service Principal para o GitHub Actions

Para que o GitHub Actions possa autenticar na Azure e no ACR:

```powershell
# Criar Service Principal
az ad sp create-for-rbac --name "WhiteLabelDeploy" --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/whitelabel-rg \
  --sdk-auth

# Dar permissão ao Service Principal para acessar o ACR
spId=$(az ad sp list --display-name "WhiteLabelDeploy" --query "[].id" -o tsv)
acrId=$(az acr show --name whitelabelacr --resource-group whitelabel-rg --query id -o tsv)

az role assignment create --assignee $spId --role AcrPush --scope $acrId
```

O comando `az ad sp create-for-rbac` retornará um JSON que você deve salvar como secret `AZURE_CREDENTIALS` no GitHub.

## 5. Configurar os secrets no GitHub

1. No GitHub, vá para seu repositório
2. Acesse Settings > Secrets and variables > Actions
3. Adicione os seguintes secrets:

   - **ACR_LOGIN_SERVER**: O servidor de login obtido acima (ex: `whitelabelacr.azurecr.io`)
   - **REGISTRY_USERNAME**: O nome de usuário do ACR 
   - **REGISTRY_PASSWORD**: A senha do ACR
   - **AZURE_CREDENTIALS**: O JSON completo retornado pelo comando `az ad sp create-for-rbac`
   - **DB_HOST**, **DB_USER**, **DB_PASS**, **DB_NAME**, **DB_PORT**, **DB_SSL**: Informações do banco de dados

## 6. Testar a conexão com o ACR

Você pode testar se consegue autenticar e enviar uma imagem para o ACR:

```powershell
# Login no ACR
az acr login --name whitelabelacr

# Build da imagem local
docker build -t whitelabelacr.azurecr.io/whitelabel:latest .

# Push da imagem para o ACR
docker push whitelabelacr.azurecr.io/whitelabel:latest
```

## 7. Criar o Azure Container App

```powershell
# Criar um ambiente Container Apps
az containerapp env create --name whitelabel-env --resource-group whitelabel-rg --location eastus

# Criar o Container App
az containerapp create \
  --name whitelabel-app \
  --resource-group whitelabel-rg \
  --environment whitelabel-env \
  --image whitelabelacr.azurecr.io/whitelabel:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server whitelabelacr.azurecr.io \
  --registry-username $(az acr credential show -n whitelabelacr --query username -o tsv) \
  --registry-password $(az acr credential show -n whitelabelacr --query passwords[0].value -o tsv) \
  --env-vars "NODE_ENV=production" "PORT=3000" "DB_HOST=seu-db-host" "DB_USER=seu-user" "DB_PASS=sua-senha" "DB_NAME=whitelabel" "DB_PORT=3306" "DB_SSL=true"
```

Depois de configurar o ACR e o Container App, o workflow do GitHub Actions estará pronto para fazer o build e o deploy automaticamente.