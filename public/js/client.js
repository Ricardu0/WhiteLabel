document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btnLogin');
    const loginEmail = document.getElementById('loginEmail');
    const loginCard = document.getElementById('loginCard');
    const clientArea = document.getElementById('clientArea');
    const clientLocacoes = document.getElementById('clientLocacoes');
    const editForm = document.getElementById('editClientForm');
    const saveButton = editForm.querySelector('button');

    let currentClient = null;

    btnLogin.addEventListener('click', async () => {
        const email = loginEmail.value.trim();
        if (!email) return alert('Informe seu email');
        const res = await fetch(`/clientes`);
        const clientes = await res.json();
        const client = clientes.find(c => c.email === email);
        if (!client) return alert('Cliente não encontrado');
        currentClient = client;
        showClientArea(client);
    });

    function showClientArea(client) {
        loginCard.classList.add('hidden');
        clientArea.classList.remove('hidden');
        document.getElementById('clientId').value = client.id;
        document.getElementById('cNome').value = client.nome;
        document.getElementById('cEmail').value = client.email;
        document.getElementById('cTelefone').value = client.telefone;
        loadClientLocacoes(client.id);
    }

    // disable save until changes
    saveButton.disabled = true;
    ['cNome','cEmail','cTelefone'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => saveButton.disabled = false);
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('clientId').value;
        const nome = document.getElementById('cNome').value;
        const email = document.getElementById('cEmail').value;
        const telefone = document.getElementById('cTelefone').value;
        const res = await fetch(`/clientes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, telefone })
        });
        if (res.ok) {
            alert('Dados atualizados');
            saveButton.disabled = true;
        } else {
            alert('Falha ao atualizar dados');
        }
    });

    async function loadClientLocacoes(clienteId) {
        const res = await fetch(`/locacoes/cliente/${clienteId}`);
        const locacoes = await res.json();
        clientLocacoes.innerHTML = '';
        locacoes.forEach(l => {
            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.innerHTML = `
                <div>
                    <strong>${l.inicio ? new Date(l.inicio).toLocaleString() : "N/A"}</strong>
                    <div><small>${l.Veiculo ? l.Veiculo.marca + ' ' + l.Veiculo.modelo : ''}</small></div>
                    <div><small>Valor: R$ ${l.valor}</small></div>
                    <div><small>Status: ${l.status}</small></div>
                </div>
                <div>
                    ${l.status === 'ativa' ? `<button class="btn btn-sm btn-outline-danger cancel" data-id="${l.id}">Cancelar</button>` : ''}
                </div>
            `;
            clientLocacoes.appendChild(item);
        });
    }

    clientLocacoes.addEventListener('click', async (e) => {
        if (e.target.classList.contains('cancel')) {
            const id = e.target.dataset.id;
            if (!confirm('Confirma cancelamento da locação #' + id + '?')) return;
            const res = await fetch(`/locacoes/${id}`, { method: 'DELETE' });
            if (res.ok) alert('Locação cancelada'); else alert('Falha ao cancelar locação');
            if (currentClient) loadClientLocacoes(currentClient.id);
        }
    });
});