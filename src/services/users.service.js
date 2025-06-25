import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
} from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { findRolById } from "../models/roles.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "secreto123";
const JWT_EXPIRES_IN = "8h";

// Login: verifica email y contraseña
export async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Contraseña incorrecta");
  }

  const token = jwt.sign({ id: user.id, rol_id: user.rol_id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    usuario: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol_id: user.rol_id,
    },
  };
}

// Crear nuevo usuario
export async function registrarUsuario({ nombre, email, password, rol_id }) {
  const existente = await findUserByEmail(email);
  if (existente)
    throw ApiError.validation([
      { campo: "email", mensaje: "El email ya está registrado" },
    ]);

  const rol = await findRolById(rol_id);
  if (!rol)
    throw ApiError.validation([
      { campo: "rol_id", mensaje: "El rol seleccionado no existe" },
    ]);

  const hashed = await bcrypt.hash(password, 10);
  const id = await createUser({ nombre, email, password: hashed, rol_id });
  return findUserById(id);
}

export async function actualizarUsuario(id, data) {
  const usuarioExistente = await findUserById(id);
  if (!usuarioExistente) {
    throw ApiError.notFound("Usuario no encontrado");
  }

  if (data.email) {
    const existente = await findUserByEmail(data.email);
    if (existente && existente.id !== id) {
      throw ApiError.validation([
        { campo: "email", mensaje: "El email ya está registrado" },
      ]);
    }
  }

  if (data.rol_id) {
    const rol = await findRolById(data.rol_id);
    if (!rol) {
      throw ApiError.validation([
        { campo: "rol_id", mensaje: "El rol seleccionado no existe" },
      ]);
    }
  }

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  await updateUserById(id, data);
  return findUserById(id);
}
