import {
  crearVentaConDetalle,
  obtenerVentaPorId,
  obtenerVentas,
} from "../models/ventas.model.js";
import { registrarLog } from "../utils/logger.js";

export async function registrarVenta(data, usuario_id) {
  const venta_id = await crearVentaConDetalle({ ...data, usuario_id });

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
