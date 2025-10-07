import express from "express";
import { getAll, getById, create, update, cancel, historyByCliente } from "../controllers/locacaoController.js";

const router = express.Router();

// debug: log requests that reach this router
router.use((req, res, next) => {
	console.log('[locacaoRoutes] ', req.method, req.path);
	next();
});

router.get("/", getAll);
// diagnostic ping route
router.get('/ping', (req, res) => res.send('pong'));
// specific route for cliente history should be declared before the generic '/:id'
router.get("/cliente/:clienteId", historyByCliente);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", cancel);

export default router;
