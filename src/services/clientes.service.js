import {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from "../models/clientes.model.js";
import { registrarLog } from "../utils/logger.js";

export async function listarClientes() {
  return await obtenerClientes();
}

export async function obtenerCliente(id) {
  return await obtenerClientePorId(id);
}

export async function nuevoCliente(data, usuario_id) {
  const id = await crearCliente(data);

  await registrarLog({
    usuario_id,
    tabla: "clientes",
    accion: "INSERT",
    descripcion: `Alta de cliente: ${data.nombre} ${data.apellido}`,
    registro_id: id,
    datos_nuevos: data,
  });

  return id;
}

export async function modificarCliente(id, data, usuario_id) {
  const clienteAnterior = await obtenerClientePorId(id);
  const result = await actualizarCliente(id, data);

  await registrarLog({
    usuario_id,
    tabla: "clientes",
    accion: "UPDATE",
    descripcion: `Modificación del cliente ID ${id}`,
    registro_id: id,
    datos_anteriores: clienteAnterior,
    datos_nuevos: data,
  });

  return result;
}

export async function borrarCliente(id, usuario_id) {
  const cliente = await obtenerClientePorId(id);
  const result = await eliminarCliente(id);

  await registrarLog({
    usuario_id,
    tabla: "clientes",
    accion: "DELETE",
    descripcion: `Baja lógica del cliente ID ${id}`,
    registro_id: id,
    datos_anteriores: cliente,
  });

  return result;
}
