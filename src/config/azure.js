import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para analisar string de conexão MySQL do Azure
function parseAzureMySQLConnectionString(connectionString) {
    try {
        // Formato padrão: Database=mydb;Data Source=myserver.mysql.database.azure.com;User Id=myuser;Password=mypass
        const params = {};
        connectionString.split(';').forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                params[key.trim()] = value.trim();
            }
        });

        return {
            host: params['Data Source'] || params.Server,
            user: params['User Id'],
            password: params.Password,
            database: params.Database,
            port: params.Port || 3306,
            ssl: true
        };
    } catch (err) {
        console.error('Erro ao analisar a string de conexão:', err);
        return null;
    }
}

// Função para detectar e configurar o Azure MySQL
function configureAzureMySQL() {
    // Verificar string de conexão MySQL do Azure
    const mysqlConnStr = process.env.MYSQLCONNSTR_localdb || process.env.DATABASE_URL;
    
    if (mysqlConnStr) {
        console.log('Conexão MySQL do Azure detectada, configurando...');
        const dbConfig = parseAzureMySQLConnectionString(mysqlConnStr);
        
        if (dbConfig) {
            // Configurar variáveis de ambiente para a aplicação
            process.env.DB_HOST = dbConfig.host;
            process.env.DB_USER = dbConfig.user;
            process.env.DB_PASS = dbConfig.password;
            process.env.DB_NAME = dbConfig.database;
            process.env.DB_PORT = dbConfig.port;
            process.env.DB_SSL = 'true';
            
            console.log('Configuração do banco de dados atualizada para Azure MySQL:');
            console.log(`  Host: ${dbConfig.host}`);
            console.log(`  Usuário: ${dbConfig.user}`);
            console.log(`  Banco de dados: ${dbConfig.database}`);
            console.log(`  Porta: ${dbConfig.port}`);
            console.log(`  SSL: habilitado`);
            
            // Criar arquivo .env para referência futura (opcional)
            try {
                const envPath = path.join(__dirname, '..', '.env');
                const envContent = `DB_HOST=${dbConfig.host}\nDB_USER=${dbConfig.user}\nDB_PASS=${dbConfig.password}\nDB_NAME=${dbConfig.database}\nDB_PORT=${dbConfig.port}\nDB_SSL=true\nNODE_ENV=production\n`;
                
                fs.writeFileSync(envPath, envContent, 'utf8');
                console.log(`Arquivo .env criado em ${envPath}`);
            } catch (err) {
                console.warn('Aviso: Não foi possível criar o arquivo .env:', err.message);
            }
            
            return true;
        }
    }
    
    console.log('Nenhuma conexão MySQL do Azure detectada, usando configuração padrão');
    return false;
}

export default configureAzureMySQL;