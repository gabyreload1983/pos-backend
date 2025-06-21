import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserById,
  createUser,
} from "../models/users.model.js";

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
  const hashed = await bcrypt.hash(password, 10);
  const id = await createUser({ nombre, email, password: hashed, rol_id });
  return findUserById(id);
}
