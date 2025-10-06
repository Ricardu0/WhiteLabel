import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Cliente from "./Cliente.js";

const Locacao = sequelize.define("Locacao", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    filme: { type: DataTypes.STRING, allowNull: false },
    dataLocacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    dataDevolucao: { type: DataTypes.DATE, allowNull: true }
});

Cliente.hasMany(Locacao, { foreignKey: "clienteId", onDelete: "CASCADE" });
Locacao.belongsTo(Cliente, { foreignKey: "clienteId" });

export default Locacao;
