import { clienteDto } from "../dto/cliente.dto.js";
import {
  listarClientes,
  obtenerCliente,
  nuevoCliente,
  modificarCliente,
  borrarCliente,
} from "../services/clientes.service.js";

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
    if (!cliente)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    next(error);
  }
}

export async function createCliente(req, res, next) {
  try {
    const clienteData = clienteDto(req.body);
    const id = await nuevoCliente(clienteData, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}

export async function updateCliente(req, res, next) {
  try {
    const clienteData = clienteDto(req.body);
    const updated = await modificarCliente(
      req.params.id,
      clienteData,
      req.user.id
    );
    if (!updated)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ message: "Cliente actualizado" });
  } catch (error) {
    next(error);
  }
}

export async function deleteCliente(req, res, next) {
  try {
    const deleted = await borrarCliente(req.params.id, req.user.id);
    if (!deleted)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    next(error);
  }
}
