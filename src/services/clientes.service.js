import {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  emailClienteDuplicado,
} from "../models/clientes.model.js";
import { registrarLog } from "../utils/logger.js";
import { ApiError } from "../utils/ApiError.js";
import { pool } from "../config/db.js";
import { existeEnTabla } from "../utils/dbHelpers.js";

export async function listarClientes() {
  return await obtenerClientes();
}

export async function obtenerCliente(id) {
  return await obtenerClientePorId(id);
}

export async function nuevoCliente(data, usuario_id) {
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

  if (data.email && (await emailClienteExiste(data.email)))
    errores.push({
      campo: "email",
      mensaje: "Ya existe un cliente con ese email",
    });

  if (errores.length > 0)
    throw new ApiError("Error de validación", 400, errores);

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
  const errores = [];

  if (data.provincia_id !== null && data.provincia_id !== undefined)
    if (!(await existeEnTabla("provincias", data.provincia_id)))
      errores.push({ campo: "provincia_id", mensaje: "Provincia inexistente" });

  if (data.ciudad_id !== null && data.ciudad_id !== undefined)
    if (!(await existeEnTabla("ciudades", data.ciudad_id)))
      errores.push({ campo: "ciudad_id", mensaje: "Ciudad inexistente" });

  if (data.email && (await emailClienteDuplicado(data.email, id)))
    errores.push({
      campo: "email",
      mensaje: "El email ya está siendo usado por otro cliente",
    });

  if (errores.length > 0)
    throw new ApiError("Error de validación", 400, errores);

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
