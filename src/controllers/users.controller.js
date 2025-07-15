import { findUserById } from "../models/users.model.js";
import {
  actualizarUsuario,
  loginUser,
  registrarUsuario,
} from "../services/users.service.js";
import { registrarLog } from "../utils/logger.js";
import { ACCIONES_LOG } from "../constants/index.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    await registrarLog({
      usuario_id: data.usuario.id,
      tabla: "usuarios",
      accion_id: ACCIONES_LOG.LOGIN,
      descripcion: `El usuario ${data.usuario.email} inició sesión`,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const { nombre, email, password, rol_id } = req.validatedData;
    const nuevoUsuario = await registrarUsuario({
      nombre,
      email,
      password,
      rol_id,
    });

    await registrarLog({
      usuario_id: req.user?.id || nuevoUsuario.id, // usa el admin si existe, o el mismo si se autoregistra
      tabla: "usuarios",
      accion_id: ACCIONES_LOG.INSERT,
      descripcion: `Usuario creado: ${email} (por ${req.user?.id || "self"})`,
      registro_id: nuevoUsuario.id,
      datos_nuevos: nuevoUsuario,
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const usuario = await findUserById(req.user.id);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const datos = req.validatedData;

    const usuarioActualizado = await actualizarUsuario(id, datos);

    res.json(usuarioActualizado);
  } catch (error) {
    next(error);
  }
}
