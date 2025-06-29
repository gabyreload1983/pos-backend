import * as model from "../models/articulos.model.js";
import { registrarLog } from "../utils/logger.js";

export async function obtenerArticulosService() {
  const articulos = await model.obtenerArticulos();
  return articulos.filter((a) => a.activo === 1);
}

export async function obtenerArticuloService(id) {
  return await model.obtenerArticuloPorId(id);
}

export async function crearArticuloService(data, usuario_id) {
  const id = await model.crearArticulo(data);
  await registrarLog({
    usuario_id,
    tabla: "articulos",
    accion: "INSERT",
    descripcion: `Se creó el artículo ${data.nombre}`,
    registro_id: id,
    datos_nuevos: data,
  });
  return id;
}

export async function actualizarArticuloService(id, data, usuario_id) {
  const anterior = await model.obtenerArticuloPorId(id);
  await model.actualizarArticulo(id, data);
  await registrarLog({
    usuario_id,
    tabla: "articulos",
    accion: "UPDATE",
    descripcion: `Se actualizó el artículo ${anterior.nombre}`,
    registro_id: id,
    datos_anteriores: anterior,
    datos_nuevos: data,
  });
}

export async function eliminarArticuloService(id, usuario_id) {
  const anterior = await model.obtenerArticuloPorId(id);
  await model.eliminarArticulo(id);
  await registrarLog({
    usuario_id,
    tabla: "articulos",
    accion: "DELETE",
    descripcion: `Se desactivó el artículo ${anterior.nombre}`,
    registro_id: id,
    datos_anteriores: anterior,
  });
}
