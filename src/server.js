import app from "./app.js";
import sequelize from "./config/database.js";

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("Banco sincronizado!");
        app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
    } catch (err) {
        console.error("Erro ao conectar ao banco:", err);
    }
})();
