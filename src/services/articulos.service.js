import {
  obtenerArticulos,
  obtenerArticuloPorId,
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo,
} from "../models/articulos.model.js";
import { registrarLog } from "../utils/logger.js";

export async function listarArticulos() {
  return await obtenerArticulos();
}

export async function obtenerArticulo(id) {
  return await obtenerArticuloPorId(id);
}

export async function nuevoArticulo(data, usuario_id) {
  const id = await crearArticulo(data);

  await registrarLog({
    usuario_id,
    tabla: "articulos",
    accion: "INSERT",
    descripcion: `Alta de artículo: ${data.nombre}`,
    registro_id: id,
    datos_nuevos: data,
  });

  return id;
}

export async function modificarArticulo(id, data, usuario_id) {
  const anterior = await obtenerArticuloPorId(id);
  const result = await actualizarArticulo(id, data);

  await registrarLog({
    usuario_id,
    tabla: "articulos",
    accion: "UPDATE",
    descripcion: `Modificación de artículo ID ${id}`,
    registro_id: id,
    datos_anteriores: anterior,
    datos_nuevos: data,
  });

  return result;
}

export async function borrarArticulo(id, usuario_id) {
  const articulo = await obtenerArticuloPorId(id);
  const result = await eliminarArticulo(id);

  await registrarLog({
    usuario_id,
    tabla: "articulos",
    accion: "DELETE",
    descripcion: `Baja lógica de artículo ID ${id}`,
    registro_id: id,
    datos_anteriores: articulo,
  });

  return result;
}
