import app from "./app.js";
import sequelize from "./config/database.js";

const PORT = process.env.PORT || 3000;
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 segundos

async function connectWithRetry(retries = MAX_RETRIES) {
    try {
        console.log("Tentando conectar ao banco de dados...");
        await sequelize.authenticate();
        console.log("Conexão com banco de dados estabelecida.");
        
        // Sincronizar modelos com banco de dados
        // Em produção, usar { alter: false } ou não usar sync é mais seguro
        const syncOptions = process.env.NODE_ENV === 'production' 
            ? {} // Sem alterações automáticas em produção
            : { alter: true };
            
        await sequelize.sync(syncOptions);
        console.log("Banco de dados sincronizado!");
        
        return true;
    } catch (err) {
        console.error(`Erro ao conectar ao banco de dados: ${err.message}`);
        
        if (retries === 0) {
            console.error("Número máximo de tentativas de conexão atingido. Abortando.");
            return false;
        }
        
        console.log(`Tentando novamente em ${RETRY_INTERVAL/1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
        return connectWithRetry(retries - 1);
    }
}

// Função para iniciar o servidor
async function startServer() {
    try {
        // Tentar conectar ao banco
        const connected = await connectWithRetry();
        
        if (!connected) {
            console.error("Não foi possível conectar ao banco de dados após múltiplas tentativas.");
            process.exit(1);
        }
        
        // Iniciar o servidor
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
        });
        
        // Armazenar a referência do servidor em uma variável global
        global.httpServer = server;
        
        // Tratamento de sinais para encerramento gracioso
        process.on('SIGTERM', () => gracefulShutdown(server));
        process.on('SIGINT', () => gracefulShutdown(server));
        
    } catch (err) {
        console.error("Erro fatal ao iniciar aplicação:", err);
        process.exit(1);
    }
}

// Função para encerramento gracioso
function gracefulShutdown(server) {
    console.log('Recebido sinal de encerramento. Fechando conexões...');
    
    // Fechar o servidor HTTP primeiro
    if (server) {
        server.close(() => {
            console.log('Servidor HTTP encerrado.');
            
            // Depois fechar a conexão com o banco de dados
            sequelize.close().then(() => {
                console.log('Conexão com banco de dados encerrada.');
                process.exit(0);
            }).catch((err) => {
                console.error('Erro ao fechar conexão com banco de dados:', err);
                process.exit(1);
            });
        });
    } else {
        // Caso não tenha servidor, fechar só o banco
        sequelize.close().then(() => {
            console.log('Conexão com banco de dados encerrada.');
            process.exit(0);
        }).catch((err) => {
            console.error('Erro ao fechar conexão com banco de dados:', err);
            process.exit(1);
        });
    }
    
    // Se o servidor não encerrar em 10s, forçar saída
    setTimeout(() => {
        console.error('Encerramento forçado após timeout.');
        process.exit(1);
    }, 10000);
}

// Iniciar o servidor
startServer();
