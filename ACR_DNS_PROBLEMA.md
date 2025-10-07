# Como resolver o erro de DNS do Container Registry, em caso de aks, e tudo mais.

O erro que você está enfrentando:
```
Run docker push ***/locadora-crud:latest
The push refers to repository [***/locadora-crud]
Get "https://***/v2/": dial tcp: lookup *** on 127.0.0.53:53: no such host
```

Este é um problema de resolução de DNS onde o GitHub Actions não consegue encontrar o endereço do seu Container Registry.

## 1. Configure os secrets no GitHub

Acesse seu repositório no GitHub, vá em Settings > Secrets and variables > Actions e adicione os seguintes secrets:

- **ACR_LOGIN_SERVER**: O endereço completo do seu Azure Container Registry
  Exemplo: `meuresgistro.azurecr.io` (não apenas o nome, mas o endereço completo com .azurecr.io)

- **REGISTRY_USERNAME**: O nome de usuário do Azure Container Registry
  Pode ser obtido no portal Azure ou com o comando:
  ```
  az acr credential show -n whitelabelacr --query username -o tsv
  ```

- **REGISTRY_PASSWORD**: A senha do Azure Container Registry
  Pode ser obtida no portal Azure ou com o comando:
  ```
  az acr credential show -n whitelabelacr --query passwords[0].value -o tsv
  ```

- **AZURE_CREDENTIALS**: JSON com as credenciais do service principal da Azure
  ```
  az ad sp create-for-rbac --name "whitelabel-deploy" --role contributor \
    --scopes /subscriptions/{subscription-id}/resourceGroups/whitelabel-rg \
    --sdk-auth
  ```

## 2. Verifique o Container Registry

1. Certifique-se de que o Azure Container Registry existe e está acessível
   ```
   az acr check-name -n whitelabelacr
   ```

2. Verifique se o service principal tem permissão para acessar o ACR
   ```
   az role assignment create \
     --assignee <service-principal-id> \
     --role AcrPush \
     --scope /subscriptions/{subscription-id}/resourceGroups/whitelabel-rg/providers/Microsoft.ContainerRegistry/registries/whitelabelacr
   ```

## 3. Solução

O arquivo de workflow foi modificado para usar o endereço completo do Container Registry através do secret `ACR_LOGIN_SERVER`.

Agora você precisa:

1. Adicionar os secrets mencionados acima
2. Fazer um commit e push das alterações
3. Verificar se o workflow é executado com sucesso

## 4. Teste manual

Para testar manualmente se o registro está funcionando:

```powershell
# Login no Azure
az login

# Login no ACR 
az acr login --name whitelabelacr

# Construir e enviar a imagem
docker build -t whitelabelacr.azurecr.io/whitelabel:latest .
docker push whitelabelacr.azurecr.io/whitelabel:latest
```

Se o push funcionar manualmente, mas falhar no GitHub Actions, é uma questão de configuração dos secrets.