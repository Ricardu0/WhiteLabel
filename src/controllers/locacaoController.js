import Locacao from "../models/Locacao.js";
import Cliente from "../models/Cliente.js";

export const getAll = async (req, res) => {
    const locacoes = await Locacao.findAll({ include: Cliente });
    res.json(locacoes);
};

export const create = async (req, res) => {
    const { filme, clienteId } = req.body;
    const locacao = await Locacao.create({ filme, clienteId });
    res.status(201).json(locacao);
};
