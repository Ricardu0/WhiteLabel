import { showStatus, fetchWithCache, getFromCache, formatCurrency } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {
    // Cache para armazenar os veículos
    let veiculosCache = [];
    
    // Elementos do DOM
    const form = document.getElementById("veiculo-form");
    const tableBody = document.getElementById("veiculos-table").querySelector("tbody");
    
    // Criar elemento para mensagens de status
    const statusDiv = document.createElement("div");
    statusDiv.className = "alert mt-3 d-none";
    statusDiv.id = "statusMessage";
    form.parentNode.insertBefore(statusDiv, form.nextSibling);
    
    // Botão para cancelar edição
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-secondary d-none ms-2";
    cancelBtn.textContent = "Cancelar";
    cancelBtn.id = "cancel-edit";
    
    // Adiciona o botão após o botão de submit
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.insertAdjacentElement("afterend", cancelBtn);
    
    // Variável para controlar estado de edição
    let editingId = null;
    
    // Função para buscar veículos da API ou do cache
    const fetchVeiculos = async () => {
        // Adicionar indicador de carregamento
        tableBody.innerHTML = "<tr><td colspan='8' class='text-center'><div class='spinner-border text-primary' role='status'><span class='visually-hidden'>Carregando...</span></div></td></tr>";
        
        await fetchWithCache(
            "/veiculos", 
            veiculosCache,
            (data) => {
                // Replacement for the entire array
                veiculosCache = data;
                renderVeiculos();
            },
            (error) => {
                // Se houver erro, tenta renderizar o que tiver em cache
                if (veiculosCache.length > 0) {
                    showStatus("Usando dados em cache. Falha ao atualizar da API.", true, "statusMessage");
                    renderVeiculos();
                } else {
                    tableBody.innerHTML = `<tr><td colspan='8' class='text-center text-danger'>Erro ao carregar veículos: ${error.message}</td></tr>`;
                }
            },
            "statusMessage"
        );
    };
    
    // Função para renderizar veículos do cache
    const renderVeiculos = () => {
        tableBody.innerHTML = "";
        
        if (veiculosCache.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>Nenhum veículo encontrado</td></tr>";
            return;
        }
        
        veiculosCache.forEach(veiculo => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${veiculo.id}</td>
                <td>${veiculo.marca}</td>
                <td>${veiculo.modelo}</td>
                <td>${veiculo.ano}</td>
                <td>${veiculo.placa}</td>
                <td>${veiculo.disponivel ? "Sim" : "Não"}</td>
                <td>${formatCurrency(veiculo.precoDiaria)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary edit" data-id="${veiculo.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger delete ms-2" data-id="${veiculo.id}">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };
    
    // Função para preencher o formulário com dados do veículo
    const fillForm = (veiculo) => {
        document.getElementById("marca").value = veiculo.marca;
        document.getElementById("modelo").value = veiculo.modelo;
        document.getElementById("ano").value = veiculo.ano;
        document.getElementById("placa").value = veiculo.placa;
        document.getElementById("precoDiaria").value = veiculo.precoDiaria;
        
        // Atualizar a UI para modo de edição
        submitBtn.textContent = "Atualizar";
        submitBtn.classList.replace("btn-primary", "btn-success");
        cancelBtn.classList.remove("d-none");
        
        // Scroll para o formulário
        form.scrollIntoView({ behavior: "smooth" });
    };
    
    // Função para limpar o formulário
    const clearForm = () => {
        form.reset();
        editingId = null;
        submitBtn.textContent = "Cadastrar";
        submitBtn.classList.replace("btn-success", "btn-primary");
        cancelBtn.classList.add("d-none");
    };
    
    // Evento de submissão do formulário
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const getVeiculoData = () => {
            return {
                marca: document.getElementById("marca").value.trim(),
                modelo: document.getElementById("modelo").value.trim(),
                ano: document.getElementById("ano").value,
                placa: document.getElementById("placa").value.trim(),
                precoDiaria: document.getElementById("precoDiaria").value
            };
        };
        
        if (editingId) {
            // Modo de edição
            const url = `/veiculos/${editingId}`;
            const successMessage = `Veículo #${editingId} atualizado com sucesso!`;
            
            const onSuccess = (updatedVeiculo) => {
                // Atualiza o item no cache
                const index = veiculosCache.findIndex(v => v.id == editingId);
                if (index !== -1) {
                    veiculosCache[index] = updatedVeiculo;
                    renderVeiculos();
                } else {
                    // Se não encontrou no cache, recarrega todos
                    fetchVeiculos();
                }
                clearForm();
            };
            
            await handleFormSubmit(
                form,
                url,
                "PUT",
                getVeiculoData,
                onSuccess,
                "statusMessage",
                successMessage
            );
        } else {
            // Modo de criação
            const url = "/veiculos";
            const successMessage = "Veículo cadastrado com sucesso!";
            
            const onSuccess = (novoVeiculo) => {
                veiculosCache.push(novoVeiculo);
                renderVeiculos();
                clearForm();
            };
            
            await handleFormSubmit(
                form,
                url,
                "POST",
                getVeiculoData,
                onSuccess,
                "statusMessage",
                successMessage
            );
        }
    });
    
    // Evento para botões de edição e exclusão
    tableBody.addEventListener("click", async (e) => {
        // Deletar veículo
        if (e.target.classList.contains("delete")) {
            const id = e.target.dataset.id;
            
            // Encontra o veículo no cache para melhorar a mensagem de confirmação
            const veiculo = getFromCache(veiculosCache, id);
            const veiculoInfo = veiculo ? `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})` : `#${id}`;
            
            if (!confirm(`Confirma exclusão do veículo: ${veiculoInfo}?`)) {
                return;
            }
            
            try {
                const response = await fetch(`/veiculos/${id}`, { method: "DELETE" });
                
                if (!response.ok) {
                    throw new Error(`Erro ao excluir: ${response.status}`);
                }
                
                // Remover do cache e re-renderizar
                veiculosCache = veiculosCache.filter(veiculo => veiculo.id != id);
                renderVeiculos();
                
                showStatus(`Veículo ${veiculoInfo} excluído com sucesso!`, false, "statusMessage");
                
                // Se estiver editando este veículo, limpar o formulário
                if (editingId == id) {
                    clearForm();
                }
            } catch (error) {
                console.error("Erro ao excluir:", error);
                showStatus(`Falha ao excluir: ${error.message}`, true, "statusMessage");
            }
        }
        
        // Editar veículo
        if (e.target.classList.contains("edit")) {
            const id = e.target.dataset.id;
            
            try {
                // Tenta obter do cache primeiro
                const veiculo = getFromCache(veiculosCache, id);
                
                if (veiculo) {
                    editingId = id;
                    fillForm(veiculo);
                } else {
                    throw new Error("Veículo não encontrado no cache");
                }
            } catch (error) {
                console.error("Erro ao editar:", error);
                showStatus("Falha ao carregar dados para edição", true, "statusMessage");
            }
        }
    });
    
    // Botão cancelar edição
    cancelBtn.addEventListener("click", () => {
        clearForm();
        showStatus("Edição cancelada", false, "statusMessage");
    });
    
    // Inicializar
    fetchVeiculos();
});