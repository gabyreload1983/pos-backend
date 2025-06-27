import {
  crearProveedor,
  obtenerTodos,
  obtenerPorId,
  modificarProveedor,
  borrarProveedor,
} from "../models/proveedores.model.js";
import { ApiError } from "../utils/ApiError.js";
import { registrarLog } from "../utils/logger.js";

export async function obtenerProveedores() {
  return await obtenerTodos();
}

export async function obtenerProveedorPorId(id) {
  const proveedor = await obtenerPorId(id);
  if (!proveedor) throw new ApiError("Proveedor no encontrado", 404);
  return proveedor;
}

export async function nuevoProveedor(data, usuario_id) {
  const id = await crearProveedor(data);

  await registrarLog({
    usuario_id,
    tabla: "proveedores",
    accion: "INSERT",
    descripcion: `Alta de proveedor: ${data.nombre}`,
    registro_id: id,
    datos_nuevos: data,
  });

  return id;
}

export async function actualizarProveedor(id, data, usuario_id) {
  const proveedorAnterior = await obtenerProveedorPorId(id);
  const actualizado = await modificarProveedor(id, data);

  await registrarLog({
    usuario_id,
    tabla: "proveedores",
    accion: "UPDATE",
    descripcion: `Modificación del proveedor ID ${id}`,
    registro_id: id,
    datos_anteriores: proveedorAnterior,
    datos_nuevos: data,
  });

  return actualizado;
}

export async function eliminarProveedor(id) {
  const proveedor = await obtenerProveedorPorId(id);
  const eliminado = await borrarProveedor(id);

  await registrarLog({
    usuario_id,
    tabla: "proveedores",
    accion: "DELETE",
    descripcion: `Baja lógica del proveedor ID ${id}`,
    registro_id: id,
    datos_anteriores: proveedor,
  });

  return eliminado;
}
