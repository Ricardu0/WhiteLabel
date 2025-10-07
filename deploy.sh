#!/bin/bash

# Script de implantação para Azure Web App, localmente

# Abortar em caso de erro
set -e

# Informações básicas
echo "Deployment script started"
echo "Node version:"
node --version
echo "NPM version:"
npm --version

# 1. Instalar dependências
echo "Installing dependencies..."
npm ci --only=production

# 2. Criar arquivos .env se necessário
if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASS" ] && [ -n "$DB_NAME" ]; then
    echo "Creating .env file from environment variables..."
    echo "DB_HOST=$DB_HOST" > .env
    echo "DB_USER=$DB_USER" >> .env
    echo "DB_PASS=$DB_PASS" >> .env
    echo "DB_NAME=$DB_NAME" >> .env
    echo "DB_PORT=${DB_PORT:-3306}" >> .env
    echo "NODE_ENV=production" >> .env
    
    if [ -n "$MYSQLCONNSTR_localdb" ]; then
        echo "DB_SSL=true" >> .env
        echo "Azure MySQL connection string detected, enabling SSL."
    fi
else
    echo "Database environment variables not fully set."
    echo "Application will use default configuration or existing .env file if available."
fi

# 3. Adicione outras etapas específicas da implantação aqui, se necessário

echo "Deployment script completed successfully"

# Sucesso
exit 0