import { pool } from "../config/db.js";
import { ACCIONES_LOG } from "../constants/acciones_log.js";
import {
  actualizarCostoArticulo,
  obtenerCostoYPrecioVenta,
  recalcularPrecioVenta,
  tieneNroSerie,
} from "../models/articulos.model.js";
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
import {
  existeComprobanteProveedor,
  existeEnTabla,
  existenSeriesDuplicadas,
  insertarNumerosSerie,
} from "../utils/dbHelpers.js";
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

    await connection.beginTransaction();

    // 1. Crear cabecera
    const compra_id = await crearCompra(connection, {
      ...data,
      usuario_id,
    });

    // 2. Detalle de artículos
    await insertarDetalleCompra(connection, compra_id, data.items);

    // 3. Actualizar stock y registrar movimientos

    if (data.mueve_stock) {
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
                campo: `series del artículo ${item.articulo_id}`,
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

          const seriesDuplicadas = await existenSeriesDuplicadas(series);
          if (seriesDuplicadas) {
            throw ApiError.conflict(
              `Los siguientes números de serie ya existen: ${seriesDuplicadas.join(
                ", "
              )}`
            );
          }

          await insertarDetalleCompraSeries(connection, detalle.id, series);
          await insertarNumerosSerie(
            connection,
            item.articulo_id,
            item.series,
            data.sucursal_id
          );
        }

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

export async function registrarCompraDesdeRemitos(data, usuario_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Validar remitos
    const [remitos] = await connection.query(
      `SELECT id FROM remitos_compra WHERE id IN (?)`,
      [data.remitos_id]
    );
    if (remitos.length !== data.remitos_id.length) {
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
    const [result] = await connection.query(
      `INSERT INTO compras (
        proveedor_id, sucursal_id, tipo_comprobante_id,
        punto_venta, numero_comprobante, total, observaciones,
        estado_remito, mueve_stock, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completo', 0, ?)`,
      [
        data.proveedor_id,
        data.sucursal_id,
        data.tipo_comprobante_id,
        data.punto_venta,
        data.numero_comprobante,
        data.total,
        data.observaciones ?? null,
        usuario_id,
      ]
    );
    const compra_id = result.insertId;

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
          moneda_id, cotizacion_dolar
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          compra_id,
          item.articulo_id,
          cantidad,
          item.costo_unitario,
          moneda_id,
          item.cotizacion_dolar ?? null,
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
