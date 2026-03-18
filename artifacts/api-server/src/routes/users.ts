import { Router } from "express";
import { authenticate } from "../lib/auth.js";

const router = Router();

const MOCK_USERS = [
  { id: 1, name: "Administrador Demo", email: "admin@fazenda.com", role: "admin" },
];

router.get("/", authenticate, async (_req, res) => {
  res.json(MOCK_USERS);
});

export default router;
