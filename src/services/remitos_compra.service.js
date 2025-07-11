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
} from "../models/remitos_compra.model.js";
import {
  actualizarStock,
  registrarMovimientoStock,
} from "../models/stock.model.js";
import { obtenerCompraPorId } from "../models/compras.model.js";
import { ApiError } from "../utils/ApiError.js";
import { registrarLog } from "../utils/logger.js";

export async function registrarRemitoCompra(data, usuario_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Obtener compra
    const compra = await obtenerCompraPorId(data.compra_id);
    if (!compra) {
      throw ApiError.notFound("Compra no encontrada");
    }
    if (compra.mueve_stock === 1) {
      throw ApiError.badRequest("La compra ya movió stock");
    }

    // 2. Validar remanente
    const pendientes = await obtenerPendientesCompra(data.compra_id);
    const errores = [];

    const pendientesMap = new Map();
    pendientes.forEach((p) => pendientesMap.set(p.detalle_compra_id, p));

    const itemsConArticulo = [];

    for (const item of data.items) {
      const detalle = pendientesMap.get(item.detalle_compra_id);
      if (!detalle) {
        errores.push({
          campo: `detalle_compra_id ${item.detalle_compra_id}`,
          mensaje: "No pertenece a esta compra",
        });
        continue;
      }

      const restante = detalle.cantidad - detalle.cantidad_remitada;
      if (item.cantidad > restante) {
        errores.push({
          campo: `items`,
          mensaje: `No puede remitir más de lo pendiente (${restante}) para artículo ID ${detalle.articulo_id}`,
        });
      }

      itemsConArticulo.push({
        detalle_compra_id: item.detalle_compra_id,
        articulo_id: detalle.articulo_id,
        cantidad: item.cantidad,
        series: item.series ?? [],
      });
    }

    if (errores.length > 0) {
      throw ApiError.validation(errores);
    }

    // 3. Crear remito
    const remito_id = await crearRemitoCompra(connection, {
      ...data,
      usuario_id,
      proveedor_id: compra.proveedor_id,
    });

    await vincularRemitoConCompra(connection, data.compra_id, remito_id);

    let total = 0;

    // 4. Insertar detalle + stock + series
    for (const item of itemsConArticulo) {
      const detalleCompra = pendientesMap.get(item.detalle_compra_id);
      const inserted = await insertarDetalleRemitoCompra(
        connection,
        remito_id,
        [item]
      );
      const detalle_remito_id = inserted[0].detalle_remito_id;

      await actualizarStock(
        connection,
        detalleCompra.articulo_id,
        data.sucursal_id,
        item.cantidad
      );
      await registrarMovimientoStock(connection, {
        articulo_id: detalleCompra.articulo_id,
        sucursal_id: data.sucursal_id,
        cantidad: item.cantidad,
        origen: "compra",
        origen_id: data.compra_id,
      });

      const requiereSerie = await tieneNroSerie(detalleCompra.articulo_id);
      if (requiereSerie) {
        const series = item.series ?? [];
        if (series.length !== item.cantidad) {
          throw ApiError.validation([
            {
              campo: `series`,
              mensaje: `Cantidad de series (${series.length}) no coincide con la cantidad remitida (${item.cantidad})`,
            },
          ]);
        }

        await insertarRemitoSeries(connection, detalle_remito_id, series);
      }

      total += item.cantidad * detalleCompra.costo_unitario;
    }

    // 5. Estado remito compra
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
      completos ? "completo" : "parcial"
    );

    // 6. Auditar
    await registrarLog({
      usuario_id,
      tabla: "remitos_compra",
      accion: "INSERT",
      descripcion: `Remito registrado ID ${remito_id} desde compra ID ${data.compra_id}`,
      registro_id: remito_id,
      datos_nuevos: data,
    });

    await connection.commit();
    connection.release();
    return remito_id;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}
