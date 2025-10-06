import Cliente from "../models/Cliente.js";

export const getAll = async (req, res) => {
    const clientes = await Cliente.findAll();
    res.json(clientes);
};

export const create = async (req, res) => {
    const { nome, email, telefone } = req.body;
    const novo = await Cliente.create({ nome, email, telefone });
    res.status(201).json(novo);
};

export const update = async (req, res) => {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });
    await cliente.update(req.body);
    res.json(cliente);
};

export const remove = async (req, res) => {
    const { id } = req.params;
    await Cliente.destroy({ where: { id } });
    res.status(204).send();
};
