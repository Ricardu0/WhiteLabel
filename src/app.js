import clienteRoutes from "./routes/clienteRoutes.js";
import locacaoRoutes from "./routes/locacaoRoutes.js";
import veiculoRoutes from "./routes/veiculoRoutes.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());

// TEMP debug logger to trace incoming requests
app.use((req, res, next) => {
	console.log('[REQ]', req.method, req.path);
	next();
});

// Add a direct test endpoint to diagnose routing issues
app.get('/test', (req, res) => {
    console.log('Test endpoint hit!');
    res.json({ message: 'Test endpoint works!' });
});

app.use("/clientes", clienteRoutes);
app.use("/locacoes", locacaoRoutes);
app.use("/veiculos", veiculoRoutes);

// also expose API under /api/* to avoid conflicts with static files
app.use("/api/locacoes", locacaoRoutes);

// Serve only the project's root public folder to avoid duplicate/conflicting static routes
const rootPublic = path.join(__dirname, "..", "public");
app.use(express.static(rootPublic));
console.log(`Serving static from: ${rootPublic}`);

// Debug: list registered routes for verification
function listRoutes() {
	if (!app._router || !app._router.stack) {
		console.log('No routes registered yet (app._router is undefined)');
		return;
	}
	const routes = [];
	app._router.stack.forEach(mw => {
		if (mw.route && mw.route.path) {
			const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
			routes.push(`${methods} ${mw.route.path}`);
		} else if (mw.name === 'router' && mw.regexp) {
			routes.push(`<router> ${mw.regexp}`);
			
			// Try to log deeper router routes
            if (mw.handle && mw.handle.stack) {
                mw.handle.stack.forEach(layer => {
                    if (layer.route) {
                        const nestedMethods = Object.keys(layer.route.methods).join(',').toUpperCase();
                        routes.push(`  ${nestedMethods} ${layer.route.path}`);
                    }
                });
            }
		}
	});
	console.log('Registered routes:\n', routes.join('\n'));
}

// Execute the listRoutes function to see registered routes
listRoutes();
listRoutes();


export default app;
