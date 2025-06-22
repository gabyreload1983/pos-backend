import {
  crearVentaConDetalle,
  obtenerVentaPorId,
  obtenerVentas,
} from "../models/ventas.model.js";
import { registrarLog } from "../utils/logger.js";
import { obtenerCajaAbierta } from "../models/cajas.model.js";

export async function registrarVenta(data, usuario_id, sucursal_id) {
  const caja = await obtenerCajaAbierta(sucursal_id);
  if (!caja) throw new Error("No hay caja abierta en esta sucursal");

  const venta_id = await crearVentaConDetalle({
    ...data,
    usuario_id,
    caja_id: caja.id,
  });

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
