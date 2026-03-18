import { Router } from "express";
import { signToken } from "../lib/auth.js";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

// Usuário Mock para o Protótipo
const MOCK_USER = {
  id: 1,
  name: "Administrador Demo",
  email: "admin@fazenda.com",
  role: "admin" as const,
  createdAt: new Date().toISOString()
};

router.post("/login", async (req, res) => {
  try {
    const body = LoginBody.parse(req.body);
    
    // Aceita qualquer senha para o usuário demo
    if (body.email === MOCK_USER.email) {
      const token = signToken(MOCK_USER.id, MOCK_USER.role);
      res.json({
        user: MOCK_USER,
        token,
      });
      return;
    }
    
    res.status(401).json({ message: "Email ou senha inválidos para o modo demonstração" });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Dados inválidos" });
  }
});

router.post("/register", async (_req, res) => {
  res.status(400).json({ message: "Registro desativado no modo demonstração" });
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logout realizado" });
});

router.get("/me", (_req, res) => {
  res.json(MOCK_USER);
});

export default router;
