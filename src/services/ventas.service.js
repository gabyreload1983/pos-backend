import {
  crearDetalleVenta,
  crearVenta,
  obtenerVentaPorId,
  obtenerVentas,
} from "../models/ventas.model.js";
import { obtenerCajaAbierta } from "../models/cajas.model.js";
import { obtenerArticulo } from "../models/articulos.model.js";
import {
  obtenerStockArticuloSucursal,
  descontarStock,
} from "../models/stock.model.js";
import { registrarMovimientoStock } from "../models/movimientos_stock.model.js";
import { registrarMovimientoCaja } from "../models/movimientos_caja.model.js";
import { registrarMovimientoCuentaCorriente } from "../models/cuentas_corrientes.model.js";
import { existeEnTabla } from "../utils/dbHelpers.js";
import { registrarLog } from "../utils/logger.js";
import { ApiError } from "../utils/ApiError.js";
import { obtenerCotizacionDolarActiva } from "../models/cotizaciones_dolar.model.js";
import { obtenerMonedaPorId } from "../models/monedas.model.js";
import { pool } from "../config/db.js";
import { ACCIONES_LOG } from "../constants/index.js";

export async function registrarVenta(data, usuario_id, sucursal_id) {
  const caja = await obtenerCajaAbierta(sucursal_id);
  if (!caja) throw new ApiError("No hay caja abierta en esta sucursal", 400);

  if (!data.cliente_id)
    throw new ApiError("Debe especificarse el cliente", 400);

  const clienteExiste = await existeEnTabla("clientes", data.cliente_id);
  if (!clienteExiste) throw new ApiError("Cliente no válido", 400);

  const cotizacionActiva = await obtenerCotizacionDolarActiva();
  if (!cotizacionActiva)
    throw new ApiError("No hay cotización de dólar activa", 400);

  if (
    data.cotizacion_usada_id &&
    cotizacionActiva.id !== data.cotizacion_usada_id
  ) {
    throw new ApiError(
      "La cotización del dólar cambió mientras completabas la venta. Actualizá los precios y volvé a intentar.",
      409
    );
  }

  let total = 0;
  const itemsProcesados = [];

  for (const item of data.items) {
    const articulo = await obtenerArticulo(item.articulo_id);
    if (!articulo)
      throw new ApiError(`Artículo ID ${item.articulo_id} no válido`, 400);

    if (articulo.controla_stock) {
      const stock = await obtenerStockArticuloSucursal(
        item.articulo_id,
        sucursal_id
      );
      if (!stock || stock.cantidad < item.cantidad) {
        throw new ApiError(
          `Stock insuficiente para ${articulo.nombre} (stock: ${
            stock?.cantidad || 0
          })`,
          400
        );
      }
    }

    if (Number(item.precio_unitario) < Number(articulo.costo)) {
      throw new ApiError(
        `El precio de venta (${item.precio_unitario}) es menor al costo (${articulo.costo}) para ${articulo.nombre}`,
        400
      );
    }

    const moneda = await obtenerMonedaPorId(item.moneda_id);
    if (!moneda) throw new ApiError("Moneda no válida", 400);

    const cotizacion = moneda.codigo_iso === "USD" ? cotizacionActiva.valor : 1;
    const subtotalARS = item.precio_unitario * item.cantidad * cotizacion;
    total += subtotalARS;

    itemsProcesados.push({
      articulo_id: item.articulo_id,
      cantidad: item.cantidad,
      precio_base: item.precio_base,
      tipo_ajuste: item.tipo_ajuste,
      porcentaje_ajuste: item.porcentaje_ajuste,
      precio_unitario: item.precio_unitario,
      moneda_id: item.moneda_id,
      cotizacion_dolar:
        moneda.codigo_iso === "USD" ? cotizacionActiva.valor : null,
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const venta_id = await crearVenta(connection, {
      cliente_id: data.cliente_id,
      usuario_id,
      caja_id: caja.id,
      tipo_pago: data.tipo_pago,
      observaciones: data.observaciones || null,
      total,
    });

    await crearDetalleVenta(connection, venta_id, itemsProcesados);

    for (const item of itemsProcesados) {
      const articulo = await obtenerArticulo(item.articulo_id);
      if (articulo.controla_stock) {
        await descontarStock(item.articulo_id, sucursal_id, item.cantidad);
        await registrarMovimientoStock({
          articulo_id: item.articulo_id,
          sucursal_id,
          cantidad: -item.cantidad,
          tipo: "salida",
          origen: "venta",
          origen_id: venta_id,
          observaciones: `Venta ID ${venta_id}`,
        });
      }
    }

    if (data.tipo_pago !== "cuenta corriente") {
      await registrarMovimientoCaja({
        caja_id: caja.id,
        tipo_movimiento: "ingreso",
        motivo: "venta",
        descripcion: `Venta ID ${venta_id}`,
        monto: total,
      });
    }

    if (data.tipo_pago === "cuenta corriente") {
      await registrarMovimientoCuentaCorriente({
        cliente_id: data.cliente_id,
        venta_id,
        tipo_movimiento: "venta",
        descripcion: `Venta ID ${venta_id}`,
        monto: total,
      });
    }

    await registrarLog({
      usuario_id,
      tabla: "ventas",
      accion_id: ACCIONES_LOG.INSERT,
      descripcion: `Nueva venta ID ${venta_id}`,
      registro_id: venta_id,
      datos_nuevos: data,
    });

    await connection.commit();
    connection.release();
    return venta_id;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

export async function listarVentas() {
  return await obtenerVentas();
}

export async function obtenerVenta(id) {
  return await obtenerVentaPorId(id);
}
