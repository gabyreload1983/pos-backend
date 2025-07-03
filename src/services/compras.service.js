import { pool } from "../config/db.js";
import { tieneNroSerie } from "../models/articulos.model.js";
import {
  crearCompra,
  insertarDetalleCompra,
  insertarDetalleCompraSeries,
  obtenerCompraPorId,
  obtenerCompras,
} from "../models/compras.model.js";
import {
  actualizarStock,
  obtenerComprasPorProveedor,
  registrarMovimientoStock,
} from "../models/stock.model.js";
import { ApiError } from "../utils/ApiError.js";
import { existeEnTabla } from "../utils/dbHelpers.js";
import { registrarLog } from "../utils/logger.js";

export async function registrarCompra(data, usuario_id) {
  const errores = [];

  const proveedorOK = await existeEnTabla("proveedores", data.proveedor_id);
  if (!proveedorOK)
    errores.push({ campo: "proveedor_id", mensaje: "Proveedor no válido" });

  const sucursalOK = await existeEnTabla("sucursales", data.sucursal_id);
  if (!sucursalOK)
    errores.push({ campo: "sucursal_id", mensaje: "Sucursal no válida" });

  const tipoComprobanteOK = await existeEnTabla(
    "tipos_comprobante",
    data.tipo_comprobante_id
  );
  if (!tipoComprobanteOK)
    errores.push({
      campo: "tipo_comprobante_id",
      mensaje: "Tipo de comprobante no válido",
    });

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const erroresItem = [];

    const articuloOK = await existeEnTabla("articulos", item.articulo_id);
    if (!articuloOK)
      erroresItem.push({
        campo: `items[${i}].articulo_id`,
        mensaje: "Artículo no válido",
      });

    const monedaOK = await existeEnTabla("monedas", item.moneda_id);
    if (!monedaOK)
      erroresItem.push({
        campo: `items[${i}].moneda_id`,
        mensaje: "Moneda no válida",
      });

    errores.push(...erroresItem);
  }

  if (errores.length > 0) {
    throw ApiError.validation(errores);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Crear cabecera
    const compra_id = await crearCompra(connection, {
      ...data,
      usuario_id,
    });

    // 2. Detalle de artículos
    await insertarDetalleCompra(connection, compra_id, data.items);

    // 3. Actualizar stock y registrar movimientos

    for (const item of data.items) {
      await actualizarStock(
        connection,
        item.articulo_id,
        data.sucursal_id,
        item.cantidad
      );
      await registrarMovimientoStock(connection, {
        articulo_id: item.articulo_id,
        sucursal_id: data.sucursal_id,
        cantidad: item.cantidad,
        compra_id,
      });

      const requiereSerie = await tieneNroSerie(item.articulo_id);
      if (requiereSerie) {
        const series = item.series ?? [];
        if (series.length !== item.cantidad) {
          throw ApiError.validation([
            {
              campo: `items[${i}].series`,
              mensaje: `Cantidad de series (${series.length}) no coincide con la cantidad comprada (${item.cantidad}) para el artículo ID ${item.articulo_id}`,
            },
          ]);
        }

        // Obtener el ID del detalle_compra
        const [[detalle]] = await connection.query(
          `SELECT id FROM detalle_compra 
       WHERE compra_id = ? AND articulo_id = ? 
       ORDER BY id DESC LIMIT 1`,
          [compra_id, item.articulo_id]
        );

        if (!detalle?.id) {
          throw new ApiError(
            `No se pudo obtener el detalle de compra para artículo ID ${item.articulo_id}`,
            500
          );
        }

        await insertarDetalleCompraSeries(connection, detalle.id, series);
      }
    }

    // 4. Auditoría
    await registrarLog({
      usuario_id,
      tabla: "compras",
      accion: "INSERT",
      descripcion: `Compra registrada ID ${compra_id}`,
      registro_id: compra_id,
      datos_nuevos: data,
    });

    await connection.commit();
    connection.release();

    return compra_id;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

export async function listarCompras() {
  return await obtenerCompras();
}

export async function getCompra(id) {
  return await obtenerCompraPorId(id);
}

export async function getComprasProveedor(proveedor_id) {
  return await obtenerComprasPorProveedor(proveedor_id);
}
