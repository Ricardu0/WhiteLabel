# Implantação Manual na Azure

Este documento explica como implantar manualmente a aplicação WhiteLabel na Azure, sem a necessidade de configurar Service Principal ou automação completa pelo GitHub Actions.

## 1. Construir a Imagem Docker Localmente

```powershell
# Construir a imagem localmente
docker build -t whitelabel:latest .
```

## 2. Fazer Login no Azure Container Registry (ACR)

```powershell
# Logar na Azure
az login

# Criar ACR se ainda não tiver
az acr create --name whitelabelacr --resource-group whitelabel-rg --sku Basic --admin-enabled true

# Obter credenciais do ACR
$acrLoginServer = az acr show -n whitelabelacr -g whitelabel-rg --query loginServer -o tsv
$acrUsername = az acr credential show -n whitelabelacr -g whitelabel-rg --query username -o tsv
$acrPassword = az acr credential show -n whitelabelacr -g whitelabel-rg --query passwords[0].value -o tsv

# Fazer login no ACR
az acr login --name whitelabelacr
```

## 3. Marcar e Enviar a Imagem para o ACR

```powershell
# Marcar a imagem com o endereço do ACR
docker tag whitelabel:latest $acrLoginServer/whitelabel:latest

# Enviar a imagem para o ACR
docker push $acrLoginServer/whitelabel:latest
```

## 4. Criar o Container App manualmente

### Usando o Portal Azure:

1. Acesse o [Portal Azure](https://portal.azure.com)
2. Vá para "Create a resource" > "Container Apps"
3. Preencha os campos:
   - Nome: whitelabel-app
   - Grupo de recursos: whitelabel-rg
   - Region: Escolha a mais próxima
   - Container Apps Environment: Crie um novo ou selecione existente
4. Na seção "Container":
   - Nome da imagem: whitelabelacr.azurecr.io/whitelabel:latest
   - Tipo de registro: Azure Container Registry
   - Selecione seu ACR
5. Na seção "Networking":
   - Ingress: Enabled
   - Ingress visibility: External
   - Target port: 3000
6. Na seção "Environment variables":
   - NODE_ENV: production
   - PORT: 3000
   - DB_HOST: [seu-servidor-db]
   - DB_USER: [seu-usuario-db]
   - DB_PASS: [sua-senha-db]
   - DB_NAME: whitelabel
   - DB_PORT: 3306
   - DB_SSL: true

### Usando a Azure CLI:

```powershell
# Criar um ambiente Container Apps
az containerapp env create --name whitelabel-env --resource-group whitelabel-rg --location eastus

# Criar Container App
az containerapp create \
  --name whitelabel-app \
  --resource-group whitelabel-rg \
  --environment whitelabel-env \
  --image $acrLoginServer/whitelabel:latest \
  --registry-server $acrLoginServer \
  --registry-username $acrUsername \
  --registry-password $acrPassword \
  --target-port 3000 \
  --ingress external \
  --env-vars "NODE_ENV=production" "PORT=3000" \
             "DB_HOST=seu-servidor-db" "DB_USER=seu-usuario" \
             "DB_PASS=sua-senha" "DB_NAME=whitelabel" \
             "DB_PORT=3306" "DB_SSL=true"
```

## 5. Atualizar a Aplicação no Futuro

Para atualizar a aplicação, repita os passos 1-3 (build, tag e push) e então:

### Usando o Portal Azure:

1. Acesse seu Container App
2. Vá para "Revisions"
3. Clique em "Create new revision"
4. Especifique a nova imagem: whitelabelacr.azurecr.io/whitelabel:latest
5. Clique em "Create"

### Usando a Azure CLI:

```powershell
# Atualizar o Container App com a nova imagem
az containerapp update \
  --name whitelabel-app \
  --resource-group whitelabel-rg \
  --image $acrLoginServer/whitelabel:latest
```

Esta abordagem manual oferece mais controle sobre o processo de deploy e não requer a configuração de Service Principal.
