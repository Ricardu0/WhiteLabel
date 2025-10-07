# Configuração de Secrets para Deploy no Azure Web App

Para resolver os problemas de deploy no Azure Web App, é necessário configurar os seguintes secrets no seu repositório GitHub:

## 1. Secrets de autenticação do Azure

- **AZURE_CREDENTIALS**: O JSON completo de credenciais do Azure
  ```
  {
    "clientId": "<client-id>",
    "clientSecret": "<client-secret>",
    "subscriptionId": "<subscription-id>",
    "tenantId": "<tenant-id>"
  }
  ```

- **AZURE_WEBAPP_PUBLISH_PROFILE**: O perfil de publicação do seu Azure Web App
  Para obter este valor:
  1. Vá para o portal Azure
  2. Navegue até o seu Web App
  3. Clique em "Get publish profile" e baixe o arquivo
  4. Copie todo o conteúdo do arquivo XML para o secret

## 2. Secrets específicos de serviço (já configurados)

- **DB_HOST**: Endereço do servidor MySQL
- **DB_USER**: Usuário do banco de dados
- **DB_PASS**: Senha do banco de dados
- **DB_NAME**: Nome do banco de dados
- **DB_PORT**: Porta do banco de dados
- **DB_SSL**: Defina como "true" para conexões seguras

## 3. Configurando novos secrets

Para adicionar estes novos secrets:

1. Vá para seu repositório GitHub: https://github.com/Ricardu0/WhiteLabel
2. Clique em "Settings" > "Secrets and variables" > "Actions"
3. Clique em "New repository secret"
4. Adicione os secrets mencionados acima

## 4. Testando o deploy

Após configurar os secrets, você pode testar o deploy de duas maneiras:

1. Fazendo um push para a branch main
2. Executando o workflow manualmente através da aba "Actions" no GitHub

## Problemas comuns e soluções

- **Erro na autenticação**: Verifique se o JSON do AZURE_CREDENTIALS está formatado corretamente
- **Erro no perfil de publicação**: Certifique-se de copiar o arquivo XML completo sem modificações
- **Erros de conexão com o banco de dados**: Verifique se os secrets de banco de dados estão corretos