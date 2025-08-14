import { pool } from "../config/db.js";
import {
  ACCIONES_LOG,
  ORIGENES_MOVIMIENTOS_STOCK,
} from "../constants/index.js";
import {
  actualizarCostoArticulo,
  obtenerCostoYPrecioVenta,
  recalcularPrecioVenta,
} from "../models/articulos.model.js";
import {
  crearCompra,
  crearCompraDesdeRemitos,
  insertarDetalleCompra,
  insertarDetalleCompraSeries,
  obtenerCompraPorId,
  obtenerCompras,
} from "../models/compras.model.js";
import { obtenerIdDetalleCompra } from "../models/detalleCompra.model.js";
import { validarRemitosCompra } from "../models/remitos_compra.model.js";
import {
  actualizarStock,
  obtenerComprasPorProveedor,
  registrarMovimientoStock,
} from "../models/stock.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  existeComprobanteProveedor,
  existenSeriesDuplicadas,
  insertarNumerosSerie,
} from "../utils/dbHelpers.js";
import { registrarLog } from "../utils/logger.js";
import { procesarItemsCompra } from "./helpers/procesarItemsCompra.js";
import {
  calcularTotalIva,
  calcularTotalNeto,
} from "./helpers/totalesCompra.js";
import { validarDataCompra } from "./helpers/validacionCompra.js";

export async function registrarCompra(data, usuario_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await validarDataCompra({ data });

    const itemsCompra = await procesarItemsCompra({
      itemsBrutos: data.items,
      tasaCambio: data.tasa_cambio,
    });

    const total_neto = calcularTotalNeto({ itemsCompra });

    const total_iva = calcularTotalIva({
      itemsCompra,
      tipoComprobanteId: data.tipo_comprobante_id,
    });

    // 1. Crear cabecera
    const compra_id = await crearCompra({
      connection,
      data,
      usuario_id,
      total_neto,
      total_iva,
    });

    // 2. Detalle de artículos
    await insertarDetalleCompra({ connection, compra_id, itemsCompra });

    // 3. Actualizar stock y registrar movimientos

    if (data.mueve_stock) {
      for (const item of itemsCompra) {
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
          tipo: "entrada",
          origen_id: ORIGENES_MOVIMIENTOS_STOCK.COMPRA,
          origen_id_externo: compra_id,
          observaciones: `Compra ID ${compra_id}`,
        });

        if (item.tiene_nro_serie) {
          const series = item.series;
          const detalleId = await obtenerIdDetalleCompra({
            connection,
            compra_id,
            articulo_id: item.articulo_id,
          });

          if (!detalleId) {
            throw new ApiError(
              `No se pudo obtener el detalle de compra para artículo ID ${item.articulo_id}`,
              500
            );
          }

          const seriesDuplicadas = await existenSeriesDuplicadas(series);
          if (seriesDuplicadas) {
            throw ApiError.conflict(
              `Los siguientes números de serie ya existen: ${seriesDuplicadas.join(
                ", "
              )}`
            );
          }

          await insertarDetalleCompraSeries(connection, detalleId, series);
          await insertarNumerosSerie(
            connection,
            item.articulo_id,
            series,
            data.sucursal_id
          );
        }
      }
    }

    // 4. Actualizar costo si corresponde
    if (data.actualizar_costo) {
      const { costo: costo_anterior, precio_venta: precio_venta_anterior } =
        await obtenerCostoYPrecioVenta(connection, item.articulo_id);

      await actualizarCostoArticulo(
        connection,
        item.articulo_id,
        item.costo_unitario_moneda
      );
      await recalcularPrecioVenta(connection, item.articulo_id);

      const { costo: costo_nuevo, precio_venta: precio_nuevo } =
        await obtenerCostoYPrecioVenta(connection, item.articulo_id);

      await registrarLog({
        usuario_id,
        tabla: "articulos",
        accion_id: ACCIONES_LOG.UPDATE,
        descripcion: `Actualización de costo y precio_venta desde compra ID ${compra_id}`,
        registro_id: item.articulo_id,
        datos_anteriores: {
          costo: costo_anterior,
          precio_venta: precio_venta_anterior,
        },
        datos_nuevos: {
          costo: costo_nuevo,
          precio_venta: precio_nuevo,
        },
      });
    }

    // 4. Auditoría
    await registrarLog({
      usuario_id,
      tabla: "compras",
      accion_id: ACCIONES_LOG.INSERT,
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

//TODO restructurar
export async function registrarCompraDesdeRemitos(data, usuario_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Validar remitos
    const remitosValidos = await validarRemitosCompra({
      remitosId: data.remitos_id,
    });

    if (remitosValidos.length !== data.remitos_id.length) {
      throw ApiError.badRequest("Uno o más remitos no existen");
    }

    if (
      await existeComprobanteProveedor(
        data.proveedor_id,
        data.punto_venta,
        data.numero_comprobante
      )
    ) {
      throw ApiError.conflict(
        `Ya existe una compra con ese punto de venta y número de comprobante para este proveedor`
      );
    }

    // 2. Crear compra
    const compra_id = await crearCompraDesdeRemitos({ connection, data });

    // 3. Asociar remitos
    for (const remito_id of data.remitos_id) {
      await connection.query(
        `INSERT INTO remito_factura_compra (remito_id, compra_id) VALUES (?, ?)`,
        [remito_id, compra_id]
      );
    }

    // 4. Obtener cantidades remitidas por artículo
    const [cantidades] = await connection.query(
      `SELECT articulo_id, SUM(cantidad) AS cantidad
       FROM detalle_remito_compra
       WHERE remito_id IN (?)
       GROUP BY articulo_id`,
      [data.remitos_id]
    );
    const cantidadesMap = new Map();
    cantidades.forEach((row) =>
      cantidadesMap.set(row.articulo_id, Number(row.cantidad))
    );

    // 5. Insertar ítems en detalle_compra
    for (const item of data.items) {
      const cantidad = cantidadesMap.get(item.articulo_id);
      if (!cantidad) {
        throw ApiError.badRequest(
          `No se encontró cantidad remitida para artículo ID ${item.articulo_id}`
        );
      }

      // Obtener moneda_id del artículo
      const [rows] = await connection.query(
        `SELECT moneda_id FROM articulos WHERE id = ?`,
        [item.articulo_id]
      );
      const moneda_id = rows[0]?.moneda_id;
      if (!moneda_id) {
        throw ApiError.badRequest(
          `Artículo ID ${item.articulo_id} no tiene moneda asignada`
        );
      }

      await connection.query(
        `INSERT INTO detalle_compra (
          compra_id, articulo_id, cantidad, costo_unitario,
          moneda_id, tasa_cambio
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          compra_id,
          item.articulo_id,
          cantidad,
          item.costo_unitario,
          moneda_id,
          item.tasa_cambio ?? null,
        ]
      );

      if (data.actualizar_costo) {
        const { costo_anterior, precio_venta_anterior } =
          await obtenerCostoYPrecioVenta(item.articulo_id);

        await actualizarCostoArticulo(
          connection,
          item.articulo_id,
          item.costo_unitario
        );
        await recalcularPrecioVenta(connection, item.articulo_id);

        await registrarLog({
          usuario_id,
          tabla: "articulos",
          accion_id: ACCIONES_LOG.UPDATE,
          descripcion: `Actualización de costo y precio_venta desde compra ID ${compra_id}`,
          registro_id: item.articulo_id,
          datos_anteriores: {
            costo: costo_anterior,
            precio_venta: precio_venta_anterior,
          },
          datos_nuevos: {
            costo: item.costo_unitario,
            precio_venta: nuevo_precio_venta,
          },
        });
      }
    }

    // 6. Auditar
    await registrarLog({
      usuario_id,
      tabla: "compras",
      accion_id: ACCIONES_LOG.INSERT,
      descripcion: `Compra registrada desde remitos: ${data.remitos_id.join(
        ", "
      )}`,
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
