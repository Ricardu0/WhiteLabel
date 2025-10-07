document.addEventListener('DOMContentLoaded', () => {
    const API_URL = "/locacoes";
    const VEICULOS_API = "/veiculos";
    const CLIENTES_API = "/clientes";

    const errorEl = document.getElementById('locacoesError');
    const locacoesDebug = document.getElementById('locacoesDebug');
    
    // Array to store all locations for caching
    let locacoesCache = [];
    function debug(msg) {
        try {
            if (!locacoesDebug) return;
            locacoesDebug.classList.remove('d-none');
            locacoesDebug.textContent = locacoesDebug.textContent + '\n' + (new Date()).toISOString() + ' - ' + msg;
        } catch (e) {
            console.log('debug failed', e);
        }
    }

    // Function to show status messages
    function showStatus(message, isError = false) {
        errorEl.textContent = message;
        errorEl.classList.remove('d-none', 'alert-success');
        errorEl.classList.add(isError ? 'alert-danger' : 'alert-success');
        
        // Auto-hide success messages after 3 seconds
        if (!isError) {
            setTimeout(() => {
                errorEl.classList.add('d-none');
            }, 3000);
        }
    }
    
    async function listarLocacoes() {
        try {
            debug('listarLocacoes: iniciando fetch ' + API_URL);
            const res = await fetch(API_URL);
            debug('listarLocacoes: resposta status ' + res.status);
            if (!res.ok) throw new Error(`status ${res.status}`);
            const locacoes = await res.json();
            
            // Store in cache
            locacoesCache = locacoes;
            
            debug('listarLocacoes: recebido registros ' + (Array.isArray(locacoes) ? locacoes.length : 0));
            const lista = document.getElementById("listaLocacoes");
            lista.innerHTML = "";
            locacoes.forEach(l => {
                const statusBadge = l.status === 'cancelada' ? '<span class="badge bg-danger me-2">cancelada</span>' : (l.status === 'finalizada' ? '<span class="badge bg-secondary me-2">finalizada</span>' : '<span class="badge bg-success me-2">ativa</span>');
                const item = document.createElement('div');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                item.innerHTML = `
                        <div>
                                ${statusBadge}
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
            errorEl.classList.add('d-none');
        } catch (err) {
            debug('listarLocacoes: erro ' + (err && err.message ? err.message : String(err)));
            errorEl.textContent = 'Erro ao carregar lista de locações: ' + err.message;
            errorEl.classList.remove('d-none');
        }
    }

    async function loadSelects() {
        try {
            debug('loadSelects: fetch ' + VEICULOS_API + ' & ' + CLIENTES_API);
            const [vRes, cRes] = await Promise.all([fetch(VEICULOS_API), fetch(CLIENTES_API)]);
            debug('loadSelects: veiculos status ' + vRes.status + ', clientes status ' + cRes.status);
            if (!vRes.ok) throw new Error('veiculos status ' + vRes.status);
            if (!cRes.ok) throw new Error('clientes status ' + cRes.status);
            const veiculos = await vRes.json();
            const clientes = await cRes.json();
            debug('loadSelects: recebidos veiculos=' + (Array.isArray(veiculos) ? veiculos.length : 0) + ' clientes=' + (Array.isArray(clientes) ? clientes.length : 0));

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

            const clienteSel = document.getElementById('clienteId');
            clienteSel.innerHTML = '<option value="">Selecione um cliente</option>';
            clientes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.nome} (${c.email})`;
                clienteSel.appendChild(opt);
            });

            errorEl.classList.add('d-none');
        } catch (err) {
            errorEl.textContent = 'Erro ao carregar veículos/clientes: ' + err.message;
            errorEl.classList.remove('d-none');
        }
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
        
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ veiculoId, clienteId, inicio, fim })
            });
            
            if (res.ok) {
                showStatus('Locação registrada com sucesso!');
                e.target.reset();
                document.getElementById('valorPrevisto').textContent = 'R$ 0.00';
                await loadSelects();
                await listarLocacoes();
            } else {
                const txt = await res.text();
                throw new Error(txt || 'status ' + res.status);
            }
        } catch (err) {
            showStatus('Erro ao registrar locação: ' + err.message, true);
        }
    });

    // Delegated listeners for edit/cancel on the list
    document.getElementById('listaLocacoes').addEventListener('click', async (e) => {
        if (e.target.classList.contains('cancel')) {
            const id = e.target.dataset.id;
            
            // Find location in cache for better confirmation message
            const locacao = locacoesCache.find(l => l.id == id);
            const veiculoInfo = locacao?.Veiculo ? `${locacao.Veiculo.marca} ${locacao.Veiculo.modelo}` : `#${id}`;
            const clienteInfo = locacao?.Cliente ? ` de ${locacao.Cliente.nome}` : '';
            
            if (!confirm(`Confirmar cancelamento da locação ${veiculoInfo}${clienteInfo}?`)) return;
            
            try {
                const res = await fetch(`/locacoes/${id}`, { method: 'DELETE' });
                
                if (res.ok) {
                    showStatus('Locação cancelada com sucesso!');
                    
                    // Update the cache - set status to canceled
                    const updatedIndex = locacoesCache.findIndex(l => l.id == id);
                    if (updatedIndex >= 0) {
                        locacoesCache[updatedIndex].status = 'cancelada';
                    }
                } else {
                    throw new Error('Falha ao cancelar locação');
                }
                
                await listarLocacoes();
            } catch (error) {
                console.error('Error canceling location:', error);
                showStatus('Falha ao cancelar locação: ' + error.message, true);
            }
            
            return;
        }
        
        if (e.target.classList.contains('edit')) {
            const id = e.target.dataset.id;
            // Find location in cache for better user experience
            const locacao = locacoesCache.find(l => l.id == id);
            
            if (locacao) {
                // Navigate to dedicated edit page and pass location data in URL
                try {
                    // Strip unnecessary fields to keep URL shorter
                    const simplifiedLocacao = {
                        id: locacao.id,
                        inicio: locacao.inicio,
                        fim: locacao.fim,
                        status: locacao.status,
                        Veiculo: locacao.Veiculo ? {
                            marca: locacao.Veiculo.marca,
                            modelo: locacao.Veiculo.modelo,
                            placa: locacao.Veiculo.placa
                        } : null,
                        Cliente: locacao.Cliente ? {
                            nome: locacao.Cliente.nome,
                            email: locacao.Cliente.email
                        } : null
                    };
                    
                    location.href = `/locacao_edit.html?id=${id}`;
                } catch (e) {
                    // Fallback to basic navigation if there's an error
                    console.error('Error passing location data:', e);
                    location.href = `/locacao_edit.html?id=${id}`;
                }
            } else {
                // Fallback if location is not in cache
                location.href = `/locacao_edit.html?id=${id}`;
            }
        }
    });

    // Handle form validation
    document.getElementById('inicio').addEventListener('change', () => {
        const inicioDate = new Date(document.getElementById('inicio').value);
        const fimDate = new Date(document.getElementById('fim').value);
        
        if (!isNaN(inicioDate) && !isNaN(fimDate) && inicioDate >= fimDate) {
            showStatus('A data de início deve ser anterior à data de fim', true);
        } else {
            errorEl.classList.add('d-none');
        }
    });
    
    document.getElementById('fim').addEventListener('change', () => {
        const inicioDate = new Date(document.getElementById('inicio').value);
        const fimDate = new Date(document.getElementById('fim').value);
        
        if (!isNaN(inicioDate) && !isNaN(fimDate) && inicioDate >= fimDate) {
            showStatus('A data de início deve ser anterior à data de fim', true);
        } else {
            errorEl.classList.add('d-none');
        }
    });

    // initial load
    loadSelects();
    listarLocacoes();

});