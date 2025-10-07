import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Cliente from "./Cliente.js";
import Veiculo from "./Veiculo.js";

const Locacao = sequelize.define("Locacao", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    inicio: { type: DataTypes.DATE, allowNull: true },
    fim: { type: DataTypes.DATE, allowNull: true },
    valor: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { type: DataTypes.ENUM('ativa','cancelada','finalizada'), defaultValue: 'ativa' }
});

Cliente.hasMany(Locacao, { foreignKey: "clienteId", onDelete: "CASCADE" });
Locacao.belongsTo(Cliente, { foreignKey: "clienteId" });

Veiculo.hasMany(Locacao, { foreignKey: "veiculoId", onDelete: "SET NULL" });
Locacao.belongsTo(Veiculo, { foreignKey: "veiculoId" });

export default Locacao;
