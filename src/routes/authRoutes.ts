import { Router } from "express";
import { login, register } from "../controllers/authController";

const router = Router();

// Endpoint de Inicio de Sesión
router.post("/login", login);

// Endpoint de Registro de Pacientes
router.post("/register", register);

export default router;
