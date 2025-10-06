const API_URL = "/locacoes";

async function listarLocacoes() {
    const res = await fetch(API_URL);
    const locacoes = await res.json();
    const lista = document.getElementById("listaLocacoes");
    lista.innerHTML = "";
    locacoes.forEach(l => {
        const li = document.createElement("li");
        li.textContent = `${l.filme} - Cliente: ${l.Cliente?.nome || "Desconhecido"}`;
        lista.appendChild(li);
    });
}

document.getElementById("formLocacao").addEventListener("submit", async e => {
    e.preventDefault();
    const filme = document.getElementById("filme").value;
    const clienteId = document.getElementById("clienteId").value;

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filme, clienteId })
    });

    e.target.reset();
    listarLocacoes();
});

listarLocacoes();
