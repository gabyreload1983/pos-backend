import { findUserById } from "../models/users.model.js";
import { loginUser, registrarUsuario } from "../services/users.service.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

export async function register(req, res) {
  try {
    const { nombre, email, password, rol_id } = req.body;
    const nuevoUsuario = await registrarUsuario({
      nombre,
      email,
      password,
      rol_id,
    });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    const usuario = await findUserById(req.user.id);
    res.json(usuario);
  } catch (error) {
    res.status(404).json({ error: "Usuario no encontrado" });
  }
}
