const API_URL = "/clientes";

async function listarClientes() {
    const res = await fetch(API_URL);
    const clientes = await res.json();
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    clientes.forEach(c => {
        const item = document.createElement("div");
        item.className = "list-group-item d-flex justify-content-between align-items-center";
        item.innerHTML = `
            <div>
                <strong>${c.nome}</strong><br>
                <small>${c.email}  ${c.telefone}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-secondary edit" data-id="${c.id}">Editar</button>
                <button class="btn btn-sm btn-outline-danger delete" data-id="${c.id}">Excluir</button>
            </div>
        `;
        lista.appendChild(item);
    });
}

document.getElementById("formCliente").addEventListener("submit", async e => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone })
    });

    e.target.reset();
    listarClientes();
});

document.getElementById("lista").addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete")) {
        const id = e.target.dataset.id;
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        listarClientes();
    }
    if (e.target.classList.contains("edit")) {
        const id = e.target.dataset.id;
        const res = await fetch(`${API_URL}/${id}`);
        const c = await res.json();
        document.getElementById('nome').value = c.nome;
        document.getElementById('email').value = c.email;
        document.getElementById('telefone').value = c.telefone;
        // change form to update mode
        const form = document.getElementById('formCliente');
        form.onsubmit = async (ev) => {
            ev.preventDefault();
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: document.getElementById('nome').value,
                    email: document.getElementById('email').value,
                    telefone: document.getElementById('telefone').value
                })
            });
            form.reset();
            form.onsubmit = null;
            listarClientes();
        };
    }
});

listarClientes();
