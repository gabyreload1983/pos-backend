import {
  listarClientes,
  obtenerCliente,
  nuevoCliente,
  modificarCliente,
  borrarCliente,
} from "../services/clientes.service.js";

export async function getClientes(req, res) {
  try {
    const clientes = await listarClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los clientes" });
  }
}

export async function getCliente(req, res) {
  try {
    const cliente = await obtenerCliente(req.params.id);
    if (!cliente)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el cliente" });
  }
}

export async function createCliente(req, res) {
  try {
    const id = await nuevoCliente(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: "Error al crear el cliente" });
  }
}

export async function updateCliente(req, res) {
  try {
    const updated = await modificarCliente(
      req.params.id,
      req.body,
      req.user.id
    );
    if (!updated)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ message: "Cliente actualizado" });
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar el cliente" });
  }
}

export async function deleteCliente(req, res) {
  try {
    const deleted = await borrarCliente(req.params.id, req.user.id);
    if (!deleted)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el cliente" });
  }
}
