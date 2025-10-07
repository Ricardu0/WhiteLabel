const API_URL = "/locacoes";
const VEICULOS_API = "/veiculos";
const CLIENTES_API = "/clientes";

async function listarLocacoes() {
    const res = await fetch(API_URL);
    const locacoes = await res.json();
    const lista = document.getElementById("listaLocacoes");
    lista.innerHTML = "";
    locacoes.forEach(l => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div>
                <strong>${l.inicio ? new Date(l.inicio).toLocaleString() : 'N/A'}</strong>
                <div><small>${l.Veiculo ? l.Veiculo.marca + ' ' + l.Veiculo.modelo : ''}</small></div>
                <div><small>Cliente: ${l.Cliente?.nome || 'Desconhecido'}</small></div>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-secondary edit" data-id="${l.id}">Editar</button>
                <button class="btn btn-sm btn-outline-danger cancel" data-id="${l.id}">Cancelar</button>
            </div>
        `;
        lista.appendChild(item);
    });
}

async function loadSelects() {
    const vRes = await fetch(VEICULOS_API);
    const veiculos = await vRes.json();
    const veiculoSel = document.getElementById('veiculoId');
    veiculoSel.innerHTML = '<option value="">Selecione um veículo</option>';
    veiculos.forEach(v => {
        if (v.disponivel) {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = `${v.marca} ${v.modelo} (${v.ano}) - R$ ${v.precoDiaria}`;
            opt.dataset.preco = v.precoDiaria;
            veiculoSel.appendChild(opt);
        }
    });

    const cRes = await fetch(CLIENTES_API);
    const clientes = await cRes.json();
    const clienteSel = document.getElementById('clienteId');
    clienteSel.innerHTML = '<option value="">Selecione um cliente</option>';
    clientes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.nome} (${c.email})`;
        clienteSel.appendChild(opt);
    });
}

function computeEstimated() {
    const veiculoSel = document.getElementById('veiculoId');
    const inicio = document.getElementById('inicio').value;
    const fim = document.getElementById('fim').value;
    const preco = Number(veiculoSel.selectedOptions[0]?.dataset?.preco || 0);
    if (!inicio || !fim || preco <= 0) {
        document.getElementById('valorPrevisto').textContent = 'R$ 0.00';
        return;
    }
    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);
    if (isNaN(inicioDate) || isNaN(fimDate) || inicioDate >= fimDate) {
        document.getElementById('valorPrevisto').textContent = 'R$ 0.00';
        return;
    }
    const days = Math.ceil(Math.abs(fimDate - inicioDate) / (1000*60*60*24));
    const total = (preco * days).toFixed(2);
    document.getElementById('valorPrevisto').textContent = `R$ ${total}`;
}

document.getElementById('veiculoId').addEventListener('change', computeEstimated);
document.getElementById('inicio').addEventListener('change', computeEstimated);
document.getElementById('fim').addEventListener('change', computeEstimated);

document.getElementById("formLocacao").addEventListener("submit", async e => {
    e.preventDefault();
    const veiculoId = document.getElementById("veiculoId").value;
    const clienteId = document.getElementById("clienteId").value;
    const inicio = document.getElementById("inicio").value;
    const fim = document.getElementById("fim").value;

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ veiculoId, clienteId, inicio, fim })
    });

    e.target.reset();
    document.getElementById('valorPrevisto').textContent = 'R$ 0.00';
    await loadSelects();
    listarLocacoes();
});

document.getElementById('listaLocacoes').addEventListener('click', async (e) => {
    if (e.target.classList.contains('cancel')) {
        const id = e.target.dataset.id;
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        listarLocacoes();
    }
    if (e.target.classList.contains('edit')) {
        // simple edit flow could be implemented -- omitted for brevity
        alert('Editar locação não implementado na UI ainda.');
    }
});

listarLocacoes();
