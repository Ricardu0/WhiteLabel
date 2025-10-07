import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env in multiple likely locations because some IDEs set different cwd
const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "src", ".env"),
    path.resolve(__dirname, "..", ".env"),
    path.resolve(__dirname, "..", "..", ".env"),
    path.resolve(process.cwd(), "..", ".env")
];

let envFound = null;
for (const p of candidates) {
    try {
        if (fs.existsSync(p)) {
            envFound = p;
            break;
        }
    } catch (err) {
        // ignore
    }
}

if (envFound) {
    dotenv.config({ path: envFound });
    console.log(`Loaded .env from: ${envFound}`);
} else {
    console.log(`.env not found in candidates: ${candidates.join(', ')}`);
    console.log('Using environment variables or defaults');
}

// Usar variáveis de ambiente com fallbacks para valores padrão
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'whitelabel';
const DB_PORT = process.env.DB_PORT || 3306;

// Em ambiente de produção, use valores mais robustos
const poolConfig = process.env.NODE_ENV === 'production' 
    ? {
        max: 20, // Máximo de conexões em produção
        min: 5,  // Mínimo de conexões em produção
        acquire: 60000, // Tempo máximo para adquirir uma conexão (60s)
        idle: 10000     // Tempo máximo que uma conexão pode ficar inativa (10s)
      }
    : {
        max: 5,  // Máximo de conexões em desenvolvimento
        min: 0,  // Mínimo de conexões em desenvolvimento
        acquire: 30000, // 30s
        idle: 10000     // 10s
      };

console.log("DB Config:", {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS ? '***' : undefined,
    database: DB_NAME,
    port: DB_PORT,
    environment: process.env.NODE_ENV || 'development'
});

const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASS,
    {
        host: DB_HOST,
        dialect: "mysql",
        port: DB_PORT,
        logging: process.env.NODE_ENV !== 'production',
        pool: poolConfig,
        // Opções adicionais para tornar a conexão mais resiliente
        dialectOptions: {
            connectTimeout: 60000, // 60 segundos
            // Configuração específica para Azure MySQL
            ...(process.env.DB_SSL === 'true' ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false // Necessário para Azure MySQL
                }
            } : {}),
            // Opções específicas para MySQL Azure
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timezone: '+00:00' // Armazenar datas em UTC
        },
        retry: {
            max: 3 // Número de tentativas de reconexão
        }
    }
);

export default sequelize;
