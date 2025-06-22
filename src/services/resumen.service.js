import { obtenerCajaAbierta } from "../models/cajas.model.js";
import {
  obtenerTotalesCaja,
  obtenerTotalesVentas,
  obtenerTotalesPagos,
} from "../models/resumen.model.js";

export async function generarResumenDiario(usuario_id) {
  const caja = await obtenerCajaAbierta(usuario_id);
  if (!caja) throw new Error("No hay caja abierta");

  const [movimientos, ventas, pagos] = await Promise.all([
    obtenerTotalesCaja(caja.id),
    obtenerTotalesVentas(caja.id),
    obtenerTotalesPagos(caja.id),
  ]);

  return {
    caja_id: caja.id,
    fecha: caja.fecha_apertura,
    movimientos,
    ventas,
    pagos,
  };
}
