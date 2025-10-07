# Configuração de Secrets no GitHub

## Como resolver o erro de autenticação na Azure

Se você recebeu o erro:
```
Error: Login failed with Error: Using auth-type: SERVICE_PRINCIPAL. Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied.
```

Você precisa criar um Service Principal na Azure e configurar os secrets corretamente.

## 1. Criar o Service Principal e obter credenciais

Abra um terminal PowerShell e execute:

```powershell
# Login na Azure
az login

# Criar o Service Principal com permissões de Contributor no grupo de recursos
az ad sp create-for-rbac --name "WhiteLabelDeploy" `
                        --role contributor `
                        --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/whitelabel-rg `
                        --sdk-auth
```

O comando retornará um JSON com as credenciais necessárias. **SALVE ESSE JSON COMPLETO**.

## 2. Acesse as configurações do seu repositório

1. Vá para https://github.com/Ricardu0/WhiteLabel/settings/secrets/actions
2. Clique em "New repository secret"

## 3. Configure os seguintes secrets:

### Para autenticação na Azure:

- Nome: `AZURE_CREDENTIALS`  
  Valor: [Cole o JSON completo retornado pelo comando acima]

### Para o Azure Container Registry:

- Nome: `ACR_LOGIN_SERVER`  
  Valor: `whitelabelacr.azurecr.io` (substitua pelo seu login server)

- Nome: `REGISTRY_USERNAME`  
  Valor: [Nome de usuário do seu ACR]

- Nome: `REGISTRY_PASSWORD`  
  Valor: [Senha do seu ACR]

### Para o banco de dados:

- Nome: `DB_HOST`  
  Valor: [Endereço do servidor MySQL]

- Nome: `DB_USER`  
  Valor: [Usuário do banco de dados]

- Nome: `DB_PASS`  
  Valor: [Senha do banco de dados]

- Nome: `DB_NAME`  
  Valor: [Nome do banco de dados]

- Nome: `DB_PORT`  
  Valor: [Porta do banco de dados, normalmente 3306]

- Nome: `DB_SSL`  
  Valor: true (para conexões MySQL na Azure)

## 4. Verifique no GitHub

1. Verifique se não há workflows desativados sendo executados 
2. Vá em "Actions" no seu repositório e verifique quais workflows estão ativos
3. Após configurar todos os secrets, faça um novo push para testar o deploy