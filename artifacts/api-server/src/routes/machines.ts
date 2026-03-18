import { Router } from "express";
import { authenticate } from "../lib/auth.js";

const router = Router();

const MOCK_MACHINES = [
  { id: 1, name: "John Deere S790", type: "colheitadeira", model: "S790", status: "ativo" },
  { id: 2, name: "New Holland TC5.90", type: "colheitadeira", model: "TC5.90", status: "ativo" },
  { id: 3, name: "Massey Ferguson 7245", type: "trator", model: "7245", status: "ativo" },
  { id: 4, name: "Case IH 9250", type: "colheitadeira", model: "9250", status: "ativo" },
  { id: 6, name: "Valtra BM 110", type: "trator", model: "BM 110", status: "manutencao" },
];

router.get("/", authenticate, async (_req, res) => {
  res.json(MOCK_MACHINES);
});

router.post("/", authenticate, async (req, res) => {
  res.status(201).json({ ...req.body, id: Math.floor(Math.random() * 1000) });
});

router.put("/:id", authenticate, async (req, res) => {
  res.json({ ...req.body, id: parseInt(req.params.id) });
});

router.delete("/:id", authenticate, async (_req, res) => {
  res.json({ message: "Máquina removida" });
});

export default router;
