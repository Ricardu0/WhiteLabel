const API_URL = "/clientes";

async function listarClientes() {
    const res = await fetch(API_URL);
    const clientes = await res.json();
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    clientes.forEach(c => {
        const li = document.createElement("li");
        li.textContent = `${c.nome} - ${c.email} - ${c.telefone}`;
        lista.appendChild(li);
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

listarClientes();
