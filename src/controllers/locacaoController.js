import Locacao from "../models/Locacao.js";
import Cliente from "../models/Cliente.js";
import Veiculo from "../models/Veiculo.js";

export const getAll = async (req, res) => {
    const locacoes = await Locacao.findAll({ include: [Cliente, Veiculo] });
    res.json(locacoes);
};

export const getById = async (req, res) => {
    const { id } = req.params;
    console.log('[locacaoController.getById] id=', id);
    const locacao = await Locacao.findByPk(id, { include: [Cliente, Veiculo] });
    if (!locacao) return res.status(404).json({ error: 'Locação não encontrada' });
    res.json(locacao);
};

export const create = async (req, res) => {
    const { clienteId, veiculoId, inicio, fim, valor } = req.body;
    if (!clienteId || !veiculoId || !inicio || !fim) return res.status(400).json({ error: 'clienteId, veiculoId, inicio e fim são obrigatórios' });
    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);
    if (isNaN(inicioDate) || isNaN(fimDate) || inicioDate >= fimDate) return res.status(400).json({ error: 'datas inválidas' });

    // checar disponibilidade: não pode haver locação ativa que se sobreponha
    const overlapping = await Locacao.findOne({
        where: {
            veiculoId,
            status: 'ativa',
            // Sequelize literal overlap: (inicio <= :fim) AND (fim >= :inicio)
        },
    });

    if (overlapping) {
        // perform precise date check in JS to be safe
        const existInicio = new Date(overlapping.inicio);
        const existFim = new Date(overlapping.fim);
        if (!(existFim <= inicioDate || existInicio >= fimDate)) {
            return res.status(409).json({ error: 'Veículo indisponível no período selecionado' });
        }
    }

    // compute valor if not provided: preço diário * dias
    let finalValor = valor;
    if (!finalValor) {
        const v = await Veiculo.findByPk(veiculoId);
        if (!v) return res.status(404).json({ error: 'Veículo não encontrado' });
        const diffMs = Math.abs(fimDate - inicioDate);
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        finalValor = Number(v.precoDiaria) * days;
    }

    const locacao = await Locacao.create({ clienteId, veiculoId, inicio: inicioDate, fim: fimDate, valor: finalValor });
    // marcar veículo como indisponível ao criar locação
    if (veiculoId) {
        const v = await Veiculo.findByPk(veiculoId);
        if (v) await v.update({ disponivel: false });
    }
    res.status(201).json(locacao);
};

export const update = async (req, res) => {
    const { id } = req.params;
    const locacao = await Locacao.findByPk(id);
    if (!locacao) return res.status(404).json({ error: "Locação não encontrada" });

    // validate date fields if provided
    const { inicio, fim, status } = req.body;
    if (inicio || fim) {
        const inicioDate = inicio ? new Date(inicio) : new Date(locacao.inicio);
        const fimDate = fim ? new Date(fim) : new Date(locacao.fim);
        if (isNaN(inicioDate) || isNaN(fimDate) || inicioDate >= fimDate) {
            return res.status(400).json({ error: 'datas inválidas' });
        }
        // normalize to Date objects for update
        req.body.inicio = inicioDate;
        req.body.fim = fimDate;
    }

    // perform update
    const previousStatus = locacao.status;
    await locacao.update(req.body);

    // if status changed to cancelada, free the vehicle; if changed to ativa, mark unavailable
    if (status && locacao.veiculoId) {
        const v = await Veiculo.findByPk(locacao.veiculoId);
        if (v) {
            if (status === 'cancelada') {
                await v.update({ disponivel: true });
            } else if (status === 'ativa') {
                await v.update({ disponivel: false });
            }
        }
    }

    // return updated record with associations
    const updated = await Locacao.findByPk(id, { include: [Cliente, Veiculo] });
    res.json(updated);
};

export const cancel = async (req, res) => {
    const { id } = req.params;
    const locacao = await Locacao.findByPk(id);
    if (!locacao) return res.status(404).json({ error: "Locação não encontrada" });
    await locacao.update({ status: 'cancelada' });
    // liberar veículo
    if (locacao.veiculoId) {
        const v = await Veiculo.findByPk(locacao.veiculoId);
        if (v) await v.update({ disponivel: true });
    }
    res.json(locacao);
};

export const historyByCliente = async (req, res) => {
    const { clienteId } = req.params;
    const locacoes = await Locacao.findAll({ where: { clienteId }, include: [Veiculo] });
    res.json(locacoes);
};
