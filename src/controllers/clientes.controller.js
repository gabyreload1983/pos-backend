import {
  listarClientes,
  obtenerCliente,
  nuevoCliente,
  modificarCliente,
  borrarCliente,
} from "../services/clientes.service.js";
import { ApiError } from "../utils/ApiError.js";

export async function getClientes(req, res, next) {
  try {
    const clientes = await listarClientes();
    res.json(clientes);
  } catch (error) {
    next(error);
  }
}

export async function getCliente(req, res, next) {
  try {
    const cliente = await obtenerCliente(req.params.id);
    if (!cliente) throw new ApiError("Cliente no encontrado", 404);

    res.json(cliente);
  } catch (error) {
    next(error);
  }
}

export async function createCliente(req, res, next) {
  try {
    const clienteData = req.validatedData;
    const id = await nuevoCliente(clienteData, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}

export async function updateCliente(req, res, next) {
  try {
    const clienteData = req.validatedData;
    const updated = await modificarCliente(
      req.params.id,
      clienteData,
      req.user.id
    );
    if (!updated) throw new ApiError("Cliente no encontrado", 404);

    res.json({ message: "Cliente actualizado" });
  } catch (error) {
    next(error);
  }
}

export async function deleteCliente(req, res, next) {
  try {
    const deleted = await borrarCliente(req.params.id, req.user.id);
    if (!deleted) throw new ApiError("Cliente no encontrado", 404);

    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    next(error);
  }
}
