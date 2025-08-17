import {
  crearDetalleVenta,
  crearVenta,
  obtenerVentaPorId,
  obtenerVentas,
} from "../models/ventas.model.js";
import { obtenerCajaAbierta } from "../models/cajas.model.js";
import { obtenerArticulo } from "../models/articulos.model.js";
import { descontarStock } from "../models/stock.model.js";
import { registrarMovimientoStock } from "../models/movimientos_stock.model.js";
import { registrarMovimientoCaja } from "../models/movimientos_caja.model.js";
import { registrarMovimientoCuentaCorriente } from "../models/cuentas_corrientes.model.js";
import { existeEnTabla, venderNumeroSerie } from "../utils/dbHelpers.js";
import { registrarLog } from "../utils/logger.js";
import { ApiError } from "../utils/ApiError.js";
import { obtenerCotizacionActiva } from "../models/cotizacionesMonedas.model.js";
import { pool } from "../config/db.js";
import {
  ACCIONES_LOG,
  TIPOS_PAGO,
  MOTIVOS_MOVIMIENTOS_CAJA,
  TIPOS_MOVIMIENTO_CTACTE,
  ORIGENES_MOVIMIENTOS_STOCK,
} from "../constants/index.js";
import { procesarItemsVenta } from "./helpers/procesarItemsVenta.js";
import { emitirFacturaAFIP } from "./afip.service.js";
import { crearComprobanteElectronico } from "../models/comprobantes_electronicos.model.js";
import {
  calcularTotalIvaVenta,
  calcularTotalNetoVenta,
} from "./helpers/totalesVenta.js";

export async function registrarVenta(data, usuario_id, sucursal_id) {
  const caja = await obtenerCajaAbierta(sucursal_id);
  if (!caja) throw new ApiError("No hay caja abierta en esta sucursal", 400);

  if (!data.cliente_id)
    throw new ApiError("Debe especificarse el cliente", 400);

  const clienteExiste = await existeEnTabla("clientes", data.cliente_id);
  if (!clienteExiste) throw new ApiError("Cliente no válido", 400);

  const cotizacionActiva = await obtenerCotizacionActiva();
  if (!cotizacionActiva)
    throw new ApiError("No hay cotización de moneda activa", 400);

  if (
    data.cotizacion_usada_id &&
    cotizacionActiva.id !== data.cotizacion_usada_id
  ) {
    throw new ApiError(
      "La cotización del dólar cambió mientras completabas la venta. Actualizá los precios y volvé a intentar.",
      409
    );
  }

  const { itemsProcesados } = await procesarItemsVenta({
    items: data.items,
    sucursal_id,
    cotizacionActiva,
  });

  const total = calcularTotalNetoVenta({ itemsProcesados });
  const total_iva = calcularTotalIvaVenta({ itemsProcesados });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const venta_id = await crearVenta({
      connection,
      ventaData: {
        cliente_id: data.cliente_id,
        usuario_id,
        caja_id: caja.id,
        tipo_pago_id: data.tipo_pago_id,
        observaciones: data.observaciones || null,
        total,
        total_iva,
      },
    });

    await crearDetalleVenta({
      connection,
      venta_id,
      items: itemsProcesados,
      requiere_afip: requiereAfip,
    });

    if (requiereAfip) {
      let afipResp;
      try {
        afipResp = await emitirFacturaAFIP({
          ventaId: venta_id,
          tipoComprobanteId: data.tipo_comprobante_id,
          puntoVenta: data.punto_venta,
          total,
          total_iva,
          items: itemsProcesados,
        });
      } catch (afipError) {
        throw new ApiError(
          `Error al emitir comprobante en AFIP: ${afipError.message}`,
          502
        );
      }
      await crearComprobanteElectronico(connection, {
        ventaId: venta_id,
        tipoComprobanteId: data.tipo_comprobante_id,
        puntoVenta: data.punto_venta,
        numeroComprobante: afipResp.numeroComprobante,
        cae: afipResp.cae,
        caeVencimiento: afipResp.caeVencimiento,
        afipEstadoId: afipResp.afipEstadoId,
        afipResponse: JSON.stringify(afipResp.raw),
      });
    }

    for (const item of itemsProcesados) {
      const articulo = await obtenerArticulo(item.articulo_id);
      if (articulo.controla_stock) {
        await descontarStock(item.articulo_id, sucursal_id, item.cantidad);
        await registrarMovimientoStock({
          articulo_id: item.articulo_id,
          sucursal_id,
          cantidad: -item.cantidad,
          tipo: "salida",
          origen_id: ORIGENES_MOVIMIENTOS_STOCK.VENTA,
          origen_id_externo: venta_id,
          observaciones: `Venta ID ${venta_id}`,
        });
      }
      if (articulo.tiene_nro_serie) {
        for (const serie of item.series) {
          await venderNumeroSerie(item.articulo_id, serie, sucursal_id);
        }
      }
    }

    if (data.tipo_pago_id !== TIPOS_PAGO.CUENTA_CORRIENTE) {
      await registrarMovimientoCaja({
        caja_id: caja.id,
        tipo_movimiento: "ingreso",
        motivo_id: MOTIVOS_MOVIMIENTOS_CAJA.VENTA,
        descripcion: `Venta ID ${venta_id}`,
        monto: total,
      });
    }

    if (data.tipo_pago_id === TIPOS_PAGO.CUENTA_CORRIENTE) {
      await registrarMovimientoCuentaCorriente({
        cliente_id: data.cliente_id,
        venta_id,
        tipo_movimiento_id: TIPOS_MOVIMIENTO_CTACTE.VENTA,
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
