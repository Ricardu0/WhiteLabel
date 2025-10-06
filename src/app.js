import clienteRoutes from "./routes/clienteRoutes.js";
import locacaoRoutes from "./routes/locacaoRoutes.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());

app.use("/clientes", clienteRoutes);
app.use("/locacoes", locacaoRoutes);

app.use(express.static(path.join(__dirname, "public")));


export default app;
