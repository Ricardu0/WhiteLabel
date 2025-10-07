import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Veiculo = sequelize.define("Veiculo", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    marca: { type: DataTypes.STRING, allowNull: false },
    modelo: { type: DataTypes.STRING, allowNull: false },
    ano: { type: DataTypes.INTEGER, allowNull: false },
    placa: { type: DataTypes.STRING, allowNull: false, unique: true },
    disponivel: { type: DataTypes.BOOLEAN, defaultValue: true },
    precoDiaria: { type: DataTypes.DECIMAL(10,2), allowNull: false }
});

export default Veiculo;
