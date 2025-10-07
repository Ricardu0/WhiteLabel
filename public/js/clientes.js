const API_URL = "/clientes";

let editingId = null;
let originalData = null;
// Store all clients to avoid needing to fetch by ID
let clientesCache = [];

async function listarClientes() {
    const res = await fetch(API_URL);
    const clientes = await res.json();
    // Store the clients in our cache
    clientesCache = clientes;
    
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    clientes.forEach(c => {
        const item = document.createElement("div");
        item.className = "list-group-item d-flex justify-content-between align-items-center";
        item.innerHTML = `
            <div>
                <strong>${c.nome}</strong><br>
                <small>${c.email} • ${c.telefone}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-secondary edit" data-id="${c.id}">Editar</button>
                <button class="btn btn-sm btn-outline-danger delete" data-id="${c.id}">Excluir</button>
                <button class="btn btn-sm btn-outline-info ms-2 history" data-id="${c.id}">Histórico</button>
            </div>
        `;
        lista.appendChild(item);
    });
}
// Function to check if form data has changed compared to original data
function hasFormChanged() {
    if (!originalData) return false;
    
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    
    return nome !== originalData.nome || 
           email !== originalData.email || 
           telefone !== originalData.telefone;
}

// Function to update save button state
function updateSaveButtonState() {
    const submitBtn = document.getElementById('clienteSubmitBtn');
    if (editingId) {
        submitBtn.disabled = !hasFormChanged();
    } else {
        submitBtn.disabled = false;
    }
}

// Function to show status message
function showStatusMessage(message, isError = false) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.classList.remove('d-none', 'alert-success', 'alert-danger');
    statusMessage.classList.add(isError ? 'alert-danger' : 'alert-success');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusMessage.classList.add('d-none');
    }, 3000);
}

document.getElementById("formCliente").addEventListener("submit", async e => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;

    if (editingId) {
        try {
            // Update the client via API
            const res = await fetch(`${API_URL}/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, telefone })
            });
            
            if (!res.ok) {
                throw new Error('Falha na atualização do cliente');
            }
            
            // Update the client in our cache
            const updatedIndex = clientesCache.findIndex(c => c.id == editingId);
            if (updatedIndex >= 0) {
                clientesCache[updatedIndex] = {
                    ...clientesCache[updatedIndex],
                    nome,
                    email,
                    telefone
                };
            }
            
            showStatusMessage('Cliente atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating client:', error);
            showStatusMessage('Falha ao atualizar cliente: ' + error.message, true);
            return;
        }
        
        // Reset state
        editingId = null;
        originalData = null;
        e.target.reset();
        
        // Reset UI
        document.getElementById('clienteSubmitBtn').textContent = 'Cadastrar';
        document.getElementById('clienteSubmitBtn').disabled = false;
        document.getElementById('cancelEditBtn').classList.add('d-none');
        document.getElementById('editHistory').innerHTML = '';
        document.getElementById('editInstructions').style.display = 'none';
        
        // Refresh the client list
        listarClientes();
        return;
    }

    // create
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone })
    });
    
    if (!res.ok) {
        showStatusMessage('Falha ao cadastrar cliente', true);
        return;
    }
    
    showStatusMessage('Cliente cadastrado com sucesso!');
    e.target.reset();
    listarClientes();
});

document.getElementById("lista").addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete")) {
        const id = e.target.dataset.id;
        
        // Find client in cache for better confirmation message
        const cliente = clientesCache.find(c => c.id == id);
        const clienteName = cliente ? cliente.nome : `#${id}`;
        
        if (!confirm(`Confirma exclusão do cliente: ${clienteName}?`)) return;
        
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            
            if (res.ok) {
                // Update the cache to remove the deleted client
                clientesCache = clientesCache.filter(c => c.id != id);
                showStatusMessage('Cliente excluído com sucesso!');
            } else {
                throw new Error('Resposta do servidor não foi OK');
            }
        } catch (error) {
            console.error('Error deleting client:', error);
            showStatusMessage('Falha ao excluir cliente', true);
        }
        
        listarClientes();
    }
    if (e.target.classList.contains("edit")) {
        const id = e.target.dataset.id;
        
        // Use our cached data instead of fetching from server
        const c = clientesCache.find(cliente => cliente.id == id);
        
        if (!c) {
            showStatusMessage('Cliente não encontrado', true);
            return;
        }
        
        document.getElementById('nome').value = c.nome;
        document.getElementById('email').value = c.email;
        document.getElementById('telefone').value = c.telefone;
        
        // Store original data for comparison
        originalData = { 
            nome: c.nome, 
            email: c.email, 
            telefone: c.telefone 
        };
        
        editingId = id;
        
        // toggle UI to edit mode
        document.getElementById('clienteSubmitBtn').textContent = 'Salvar';
        document.getElementById('clienteSubmitBtn').disabled = true; // Disabled initially until changes are made
        document.getElementById('cancelEditBtn').classList.remove('d-none');
        document.getElementById('editInstructions').style.display = 'block';
        
        // load history into editHistory
        const hist = document.getElementById('editHistory');
        hist.textContent = 'Carregando histórico...';
        const hres = await fetch(`/locacoes/cliente/${id}`);
        if (!hres.ok) { 
            hist.textContent = 'Falha ao carregar histórico'; 
        } else {
            const locs = await hres.json();
            hist.innerHTML = locs.length ? 
                ('<h6>Histórico</h6><ul class="list-group">' + 
                 locs.map(l => `<li class="list-group-item">${l.inicio ? new Date(l.inicio).toLocaleString() : 'N/A'} → ${l.fim ? new Date(l.fim).toLocaleString() : 'N/A'} — ${l.Veiculo ? l.Veiculo.marca+' '+l.Veiculo.modelo : ''} — <strong>${l.status}</strong></li>`).join('') + 
                 '</ul>') : 
                '<div>Nenhuma locação</div>';
        }
    }
    if (e.target.classList.contains('history')) {
        const id = e.target.dataset.id;
        
        // Find client in cache for better modal title
        const cliente = clientesCache.find(c => c.id == id);
        const clienteName = cliente ? cliente.nome : `Cliente #${id}`;
        
        // Set up modal
        const modal = new bootstrap.Modal(document.getElementById('historyModal'));
        const modalTitle = document.querySelector('#historyModal .modal-title');
        const body = document.getElementById('historyBody');
        
        // Update modal title with client name
        if (modalTitle) {
            modalTitle.textContent = `Histórico de Locações - ${clienteName}`;
        }
        
        body.textContent = 'Carregando...';
        modal.show();
        
        try {
            const res = await fetch(`/locacoes/cliente/${id}`);
            
            if (!res.ok) {
                throw new Error('Falha ao carregar histórico');
            }
            
            const locs = await res.json();
            
            if (!locs.length) {
                body.innerHTML = '<div class="alert alert-info">Nenhuma locação encontrada para este cliente.</div>';
                return;
            }
            
            body.innerHTML = '<ul class="list-group">' + 
                locs.map(l => `
                    <li class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${l.inicio ? new Date(l.inicio).toLocaleString() : 'N/A'} → ${l.fim ? new Date(l.fim).toLocaleString() : 'N/A'}</strong>
                                <div><small>${l.Veiculo ? l.Veiculo.marca + ' ' + l.Veiculo.modelo : 'Veículo não especificado'}</small></div>
                            </div>
                            <span class="badge bg-${l.status === 'ativa' ? 'success' : l.status === 'finalizada' ? 'primary' : 'danger'}">${l.status}</span>
                        </div>
                    </li>
                `).join('') + 
                '</ul>';
        } catch (error) {
            console.error('Error loading history:', error);
            body.innerHTML = `<div class="alert alert-danger">Falha ao carregar histórico: ${error.message}</div>`;
        }
    }
});

document.getElementById('cancelEditBtn').addEventListener('click', () => {
    editingId = null;
    originalData = null;
    document.getElementById('formCliente').reset();
    document.getElementById('clienteSubmitBtn').textContent = 'Cadastrar';
    document.getElementById('clienteSubmitBtn').disabled = false;
    document.getElementById('cancelEditBtn').classList.add('d-none');
    document.getElementById('editHistory').innerHTML = '';
    document.getElementById('editInstructions').style.display = 'none';
});

// Add input event listeners to form fields to detect changes
['nome', 'email', 'telefone'].forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('input', () => {
        if (editingId) {
            updateSaveButtonState();
        }
    });
});

listarClientes();