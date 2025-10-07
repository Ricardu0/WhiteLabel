import Veiculo from "../models/Veiculo.js";
import { Op } from "sequelize";

export const getAll = async (req, res) => {
    const { marca, modelo, disponivel, minPreco, maxPreco } = req.query;
    const where = {};
    if (marca) where.marca = { [Op.like]: `%${marca}%` };
    if (modelo) where.modelo = { [Op.like]: `%${modelo}%` };
    if (disponivel !== undefined) where.disponivel = disponivel === 'true';
    if (minPreco || maxPreco) where.precoDiaria = {};
    if (minPreco) where.precoDiaria[Op.gte] = minPreco;
    if (maxPreco) where.precoDiaria[Op.lte] = maxPreco;

    const veiculos = await Veiculo.findAll({ where });
    res.json(veiculos);
};

export const create = async (req, res) => {
    const { marca, modelo, ano, placa, precoDiaria } = req.body;
    const novo = await Veiculo.create({ marca, modelo, ano, placa, precoDiaria });
    res.status(201).json(novo);
};

export const update = async (req, res) => {
    const { id } = req.params;
    const veiculo = await Veiculo.findByPk(id);
    if (!veiculo) return res.status(404).json({ error: "Veículo não encontrado" });
    await veiculo.update(req.body);
    res.json(veiculo);
};

export const remove = async (req, res) => {
    const { id } = req.params;
    await Veiculo.destroy({ where: { id } });
    res.status(204).send();
};
