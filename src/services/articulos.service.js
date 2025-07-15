import * as model from "../models/articulos.model.js";
import { registrarLog } from "../utils/logger.js";
import { ApiError } from "../utils/ApiError.js";
import { existeEnTabla } from "../utils/dbHelpers.js";
import { calcularPrecioVenta } from "../utils/articulos.js";
import { ACCIONES_LOG } from "../constants/index.js";

export async function obtenerArticulosService() {
  const articulos = await model.obtenerArticulos();
  return articulos.filter((a) => a.activo === 1);
}

export async function obtenerArticuloService(id) {
  return await model.obtenerArticuloPorId(id);
}

export async function crearArticuloService(data, usuario_id) {
  const errores = [];

  if (!(await existeEnTabla("iva_aliquotas", data.iva_aliquota_id))) {
    errores.push({
      campo: "iva_aliquota_id",
      mensaje: "El iva_aliquota_id indicado no existe",
    });
  }

  if (!(await existeEnTabla("monedas", data.moneda_id))) {
    errores.push({
      campo: "moneda_id",
      mensaje: "La moneda indicada no existe",
    });
  }

  if (
    data.categoria_id &&
    !(await existeEnTabla("categorias", data.categoria_id))
  ) {
    errores.push({
      campo: "categoria_id",
      mensaje: "La categoría indicada no existe",
    });
  }

  if (data.marca_id && !(await existeEnTabla("marcas", data.marca_id))) {
    errores.push({ campo: "marca_id", mensaje: "La marca indicada no existe" });
  }

  if (
    data.proveedor_id &&
    !(await existeEnTabla("proveedores", data.proveedor_id))
  ) {
    errores.push({
      campo: "proveedor_id",
      mensaje: "El proveedor indicado no existe",
    });
  }

  if (data.tiene_nro_serie && data.controla_stock === false) {
    errores.push({
      campo: "tiene_nro_serie",
      mensaje: "Solo puede tener número de serie si controla stock",
    });
  }

  if (errores.length > 0) {
    throw new ApiError("Error de validación", 400, errores);
  }

  const precio_venta = calcularPrecioVenta(data.costo, data.renta);
  data.precio_venta = precio_venta;

  const id = await model.crearArticulo(data);

  await registrarLog({
    usuario_id,
    tabla: "articulos",
    accion_id: ACCIONES_LOG.INSERT,
    descripcion: `Se creó el artículo ${data.nombre}`,
    registro_id: id,
    datos_nuevos: data,
  });
  return id;
}

export async function actualizarArticuloService(id, data, usuario_id) {
  const anterior = await model.obtenerArticuloPorId(id);
  if (!anterior) {
    throw new ApiError("Artículo no encontrado", 404);
  }

  const errores = [];

  if (
    data.iva_aliquota_id &&
    !(await existeEnTabla("iva_aliquotas", data.iva_aliquota_id))
  ) {
    errores.push({
      campo: "iva_aliquota_id",
      mensaje: "El IVA indicado no existe",
    });
  }

  if (data.moneda_id && !(await existeEnTabla("monedas", data.moneda_id))) {
    errores.push({
      campo: "moneda_id",
      mensaje: "La moneda indicada no existe",
    });
  }

  if (
    data.categoria_id &&
    !(await existeEnTabla("categorias", data.categoria_id))
  ) {
    errores.push({
      campo: "categoria_id",
      mensaje: "La categoría indicada no existe",
    });
  }

  if (data.marca_id && !(await existeEnTabla("marcas", data.marca_id))) {
    errores.push({ campo: "marca_id", mensaje: "La marca indicada no existe" });
  }

  if (
    data.proveedor_id &&
    !(await existeEnTabla("proveedores", data.proveedor_id))
  ) {
    errores.push({
      campo: "proveedor_id",
      mensaje: "El proveedor indicado no existe",
    });
  }

  if (data.tiene_nro_serie && data.controla_stock === false) {
    errores.push({
      campo: "tiene_nro_serie",
      mensaje: "Solo puede tener número de serie si controla stock",
    });
  }

  if (errores.length > 0) {
    throw new ApiError("Error de validación", 400, errores);
  }

  const precio_venta = calcularPrecioVenta(data.costo, data.renta);
  data.precio_venta = precio_venta;

  await model.actualizarArticulo(id, data);

  await registrarLog({
    usuario_id,
    tabla: "articulos",
    accion_id: ACCIONES_LOG.UPDATE,
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
    accion_id: ACCIONES_LOG.DELETE,
    descripcion: `Se desactivó el artículo ${anterior.nombre}`,
    registro_id: id,
    datos_anteriores: anterior,
  });
}

export async function obtenerArticulosPublicadosService() {
  return await model.obtenerArticulosPublicados();
}

export async function obtenerArticuloPorSlugService(slug) {
  return await model.obtenerArticuloPorSlug(slug);
}
