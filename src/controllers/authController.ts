import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });

    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: "Usuario inactivo" });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        rol_id: usuario.rol_id,
        rol: usuario.rol.nombre,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error en el servidor al intentar iniciar sesión" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password } = req.body;

    const pacienteRole = await prisma.role.findUnique({
      where: { nombre: "Paciente" },
    });

    if (!pacienteRole) {
      return res
        .status(500)
        .json({ error: "Rol de paciente no configurado en BD." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res
        .status(400)
        .json({ error: "El correo ya está registrado en el sistema." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol_id: pacienteRole.id_rol,
      },
    });

    // Crear el registro espejo en la tabla pacientes vacía
    await prisma.paciente.create({
      data: {
        nombre,
        fecha_nacimiento: new Date("2000-01-01T00:00:00Z"), // Default para llenar luego
      },
    });

    res.status(201).json({
      mensaje: "Cuenta creada exitosamente. Ya puedes iniciar sesión.",
      usuario: { nombre: nuevoUsuario.nombre, email: nuevoUsuario.email },
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor al crear la cuenta." });
  }
};
