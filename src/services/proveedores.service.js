import { ACCIONES_LOG } from "../constants/index.js";
import {
  crearProveedor,
  obtenerTodos,
  obtenerPorId,
  modificarProveedor,
  borrarProveedor,
  emailProveedorExiste,
  emailProveedorDuplicado,
} from "../models/proveedores.model.js";
import { ApiError } from "../utils/ApiError.js";
import { existeEnTabla } from "../utils/dbHelpers.js";
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
  const errores = [];

  if (data.provincia_id !== null && data.provincia_id !== undefined)
    if (!(await existeEnTabla("provincias", data.provincia_id)))
      errores.push({ campo: "provincia_id", mensaje: "Provincia inexistente" });

  if (data.ciudad_id !== null && data.ciudad_id !== undefined)
    if (!(await existeEnTabla("ciudades", data.ciudad_id)))
      errores.push({ campo: "ciudad_id", mensaje: "Ciudad inexistente" });

  if (data.condicion_iva_id !== null && data.condicion_iva_id !== undefined)
    if (!(await existeEnTabla("condiciones_iva", data.condicion_iva_id)))
      errores.push({
        campo: "condicion_iva_id",
        mensaje: "Condicion IVA inexistente",
      });

  if (data.email && (await emailProveedorExiste(data.email)))
    errores.push({
      campo: "email",
      mensaje: "Ya existe un proveedor con ese email",
    });

  if (errores.length > 0)
    throw new ApiError("Error de validación", 400, errores);

  const id = await crearProveedor(data);

  await registrarLog({
    usuario_id,
    tabla: "proveedores",
    accion_id: ACCIONES_LOG.INSERT,
    descripcion: `Alta de proveedor: ${data.nombre}`,
    registro_id: id,
    datos_nuevos: data,
  });

  return id;
}

export async function actualizarProveedor(id, data, usuario_id) {
  const proveedorAnterior = await obtenerProveedorPorId(id);
  const errores = [];

  if (data.provincia_id !== null && data.provincia_id !== undefined)
    if (!(await existeEnTabla("provincias", data.provincia_id)))
      errores.push({ campo: "provincia_id", mensaje: "Provincia inexistente" });

  if (data.ciudad_id !== null && data.ciudad_id !== undefined)
    if (!(await existeEnTabla("ciudades", data.ciudad_id)))
      errores.push({ campo: "ciudad_id", mensaje: "Ciudad inexistente" });

  if (data.condicion_iva_id !== null && data.condicion_iva_id !== undefined)
    if (!(await existeEnTabla("condiciones_iva", data.condicion_iva_id)))
      errores.push({
        campo: "condicion_iva_id",
        mensaje: "Condicion IVA inexistente",
      });

  if (data.email && (await emailProveedorDuplicado(data.email, id)))
    errores.push({
      campo: "email",
      mensaje: "El email ya está siendo usado por otro proveedor",
    });

  if (errores.length > 0)
    throw new ApiError("Error de validación", 400, errores);

  const actualizado = await modificarProveedor(id, data);

  await registrarLog({
    usuario_id,
    tabla: "proveedores",
    accion_id: ACCIONES_LOG.UPDATE,
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
    accion_id: ACCIONES_LOG.DELETE,
    descripcion: `Baja lógica del proveedor ID ${id}`,
    registro_id: id,
    datos_anteriores: proveedor,
  });

  return eliminado;
}
