// src/services/remitos_compra.service.js
import { pool } from "../config/db.js";
import { tieneNroSerie } from "../models/articulos.model.js";
import {
  crearRemitoCompra,
  insertarDetalleRemitoCompra,
  insertarRemitoSeries,
  vincularRemitoConCompra,
  obtenerPendientesCompra,
  actualizarEstadoRemitoCompra,
  existeRemitoCompraDuplicado,
} from "../models/remitos_compra.model.js";
import {
  actualizarStock,
  registrarMovimientoStock,
} from "../models/stock.model.js";
import { obtenerCompraPorId } from "../models/compras.model.js";
import { ApiError } from "../utils/ApiError.js";
import { registrarLog } from "../utils/logger.js";
import {
  existenSeriesDuplicadas,
  insertarNumerosSerie,
} from "../utils/dbHelpers.js";
import {
  ACCIONES_LOG,
  ESTADOS_REMITO,
  ORIGENES_MOVIMIENTOS_STOCK,
} from "../constants/index.js";

export async function registrarRemitoCompra(data, usuario_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (!data.punto_venta || !data.numero_comprobante) {
      throw ApiError.validation([
        { campo: "punto_venta", mensaje: "Requerido" },
        { campo: "numero_comprobante", mensaje: "Requerido" },
      ]);
    }

    if (data.compra_id) {
      const compra = await obtenerCompraPorId(data.compra_id);
      if (!compra) {
        throw ApiError.notFound("Compra no encontrada");
      }
      if (compra.mueve_stock === 1) {
        throw ApiError.badRequest("La compra ya movió stock");
      }

      const duplicado = await existeRemitoCompraDuplicado(connection, {
        proveedor_id: compra.proveedor_id,
        punto_venta: data.punto_venta,
        numero_comprobante: data.numero_comprobante,
      });
      if (duplicado) {
        throw ApiError.conflict(
          "Ya existe un remito para este proveedor con ese punto de venta y número"
        );
      }

      const pendientes = await obtenerPendientesCompra(
        data.compra_id,
        connection
      );
      const errores = [];
      const pendientesMap = new Map();
      pendientes.forEach((p) => pendientesMap.set(p.articulo_id, p));
      const itemsConArticulo = [];

      for (const item of data.items) {
        const detalle = pendientesMap.get(item.articulo_id);
        if (!detalle) {
          errores.push({
            campo: `articulo_id ${item.articulo_id}`,
            mensaje: "No pertenece a esta compra",
          });
          continue;
        }

        const restante = detalle.cantidad - detalle.cantidad_remitada;
        if (item.cantidad > restante) {
          errores.push({
            campo: "items",
            mensaje: `No puede remitir más de lo pendiente (${restante}) para artículo ID ${detalle.articulo_id}`,
          });
        }

        itemsConArticulo.push({
          detalle_compra_id: detalle.detalle_compra_id,
          articulo_id: detalle.articulo_id,
          cantidad: item.cantidad,
          series: item.series ?? [],
        });
      }

      if (errores.length > 0) {
        throw ApiError.validation(errores);
      }

      const remito_id = await crearRemitoCompra(connection, {
        ...data,
        usuario_id,
        proveedor_id: compra.proveedor_id,
      });

      await vincularRemitoConCompra(connection, data.compra_id, remito_id);

      for (const item of itemsConArticulo) {
        const inserted = await insertarDetalleRemitoCompra(
          connection,
          remito_id,
          [item]
        );
        const detalle_remito_id = inserted[0].detalle_remito_id;

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
          origen_id: ORIGENES_MOVIMIENTOS_STOCK.REMITO,
          origen_id_externo: remito_id,
          observaciones: `Remito ID ${remito_id}`,
        });

        const requiereSerie = await tieneNroSerie(item.articulo_id);
        if (requiereSerie) {
          if (item.series.length !== item.cantidad) {
            throw ApiError.validation([
              {
                campo: "series",
                mensaje: `Cantidad de series (${item.series.length}) no coincide con la cantidad remitida (${item.cantidad})`,
              },
            ]);
          }

          const seriesDuplicadas = await existenSeriesDuplicadas(item.series);
          if (seriesDuplicadas) {
            throw ApiError.conflict(
              `Los siguientes números de serie ya existen: ${seriesDuplicadas.join(
                ", "
              )}`
            );
          }
          await insertarRemitoSeries(
            connection,
            detalle_remito_id,
            item.series
          );

          await insertarNumerosSerie(
            connection,
            item.articulo_id,
            item.series,
            data.sucursal_id
          );
        }
      }

      const nuevosPendientes = await obtenerPendientesCompra(
        data.compra_id,
        connection
      );
      const completos = nuevosPendientes.every(
        (d) => Number(d.cantidad) === Number(d.cantidad_remitada)
      );

      await actualizarEstadoRemitoCompra(
        connection,
        data.compra_id,
        completos ? ESTADOS_REMITO.COMPLETO : ESTADOS_REMITO.PARCIAL
      );

      await registrarLog({
        usuario_id,
        tabla: "remitos_compra",
        accion_id: ACCIONES_LOG.INSERT,
        descripcion: `Remito registrado ID ${remito_id} desde compra ID ${data.compra_id}`,
        registro_id: remito_id,
        datos_nuevos: data,
      });

      await connection.commit();
      connection.release();
      return remito_id;
    }

    if (!data.compra_id) {
      const errores = [];

      if (!data.proveedor_id) {
        errores.push({ campo: "proveedor_id", mensaje: "Requerido" });
      }

      for (const item of data.items) {
        if (!item.articulo_id) {
          errores.push({
            campo: "articulo_id",
            mensaje: "Falta el ID del artículo",
          });
          continue;
        }

        const requiereSerie = await tieneNroSerie(item.articulo_id);
        if (
          requiereSerie &&
          (!item.series || item.series.length !== item.cantidad)
        ) {
          errores.push({
            campo: "series",
            mensaje: `Debe informar ${item.cantidad} series para el artículo ID ${item.articulo_id}`,
          });
        }
      }

      if (errores.length > 0) {
        throw ApiError.validation(errores);
      }

      const dupLibre = await existeRemitoCompraDuplicado(connection, {
        proveedor_id: data.proveedor_id,
        punto_venta: data.punto_venta,
        numero_comprobante: data.numero_comprobante,
      });
      if (dupLibre) {
        throw ApiError.conflict(
          "Ya existe un remito para este proveedor con ese punto de venta y número"
        );
      }

      const remito_id = await crearRemitoCompra(connection, {
        ...data,
        usuario_id,
      });

      for (const item of data.items) {
        const inserted = await insertarDetalleRemitoCompra(
          connection,
          remito_id,
          [
            {
              articulo_id: item.articulo_id,
              cantidad: item.cantidad,
              detalle_compra_id: null,
            },
          ]
        );

        const detalle_remito_id = inserted[0].detalle_remito_id;

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
          origen_id: ORIGENES_MOVIMIENTOS_STOCK.REMITO,
          origen_id_externo: remito_id,
          observaciones: `Remito ID ${remito_id}`,
        });

        if (item.series?.length) {
          await insertarRemitoSeries(
            connection,
            detalle_remito_id,
            item.series
          );
          await insertarNumerosSerie(
            connection,
            item.articulo_id,
            item.series,
            data.sucursal_id
          );
        }
      }

      await registrarLog({
        usuario_id,
        tabla: "remitos_compra",
        accion_id: ACCIONES_LOG.INSERT,
        descripcion: `Remito libre registrado ID ${remito_id}`,
        registro_id: remito_id,
        datos_nuevos: data,
      });

      await connection.commit();
      connection.release();
      return remito_id;
    }
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}
