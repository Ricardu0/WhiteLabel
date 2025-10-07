import express from "express";
import { getAll, getById, create, update, remove } from "../controllers/clienteController.js";

const router = express.Router();

// debug: log requests that reach this router
router.use((req, res, next) => {
	console.log('[clienteRoutes]', req.method, req.path);
	next();
});

// diagnostic ping
router.get('/ping', (req, res) => res.send('pong'));

router.get("/", getAll);
router.get('/:id', getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
