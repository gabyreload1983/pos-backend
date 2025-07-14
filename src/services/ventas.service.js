import {
  crearVentaConDetalle,
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

export async function registrarVenta(data, usuario_id, sucursal_id) {
  const caja = await obtenerCajaAbierta(sucursal_id);
  if (!caja) throw new ApiError("No hay caja abierta en esta sucursal", 400);

  if (data.cliente_id) {
    const clienteExiste = await existeEnTabla("clientes", data.cliente_id);
    if (!clienteExiste) throw new ApiError("Cliente no válido", 400);
  }

  const itemsProcesados = [];

  for (const item of data.items) {
    const articulo = await obtenerArticulo(item.articulo_id);
    if (!articulo) {
      throw new ApiError(`Artículo ID ${item.articulo_id} no válido`, 400);
    }

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

    itemsProcesados.push({
      articulo_id: item.articulo_id,
      cantidad: item.cantidad,
      precio_base: item.precio_base,
      tipo_ajuste: item.tipo_ajuste,
      porcentaje_ajuste: item.porcentaje_ajuste,
      precio_unitario: item.precio_unitario,
      moneda_id: item.moneda_id,
      cotizacion_dolar: item.cotizacion_dolar || null,
    });
  }

  const venta_id = await crearVentaConDetalle({
    cliente_id: data.cliente_id || null,
    usuario_id,
    caja_id: caja.id,
    tipo_pago: data.tipo_pago,
    observaciones: data.observaciones || null,
    items: itemsProcesados,
  });

  for (const item of itemsProcesados) {
    const { articulo_id, cantidad } = item;

    const articulo = await obtenerArticulo(articulo_id);
    if (articulo.controla_stock) {
      await descontarStock(articulo_id, sucursal_id, cantidad);
      await registrarMovimientoStock({
        articulo_id,
        sucursal_id,
        cantidad: -cantidad,
        tipo: "salida",
        origen: "venta",
        origen_id: venta_id,
        observaciones: `Venta ID ${venta_id}`,
      });
    }
  }

  const total = itemsProcesados.reduce(
    (acc, i) => acc + i.precio_unitario * i.cantidad,
    0
  );

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
    accion: "INSERT",
    descripcion: `Nueva venta ID ${venta_id}`,
    registro_id: venta_id,
    datos_nuevos: data,
  });

  return venta_id;
}

export async function listarVentas() {
  return await obtenerVentas();
}

export async function obtenerVenta(id) {
  return await obtenerVentaPorId(id);
}
