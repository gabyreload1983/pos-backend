import { obtenerVentasPorDia } from "../models/estadisticas.model.js";

export async function ventasPorDia(desde, hasta) {
  if (!desde || !hasta) throw new Error("Debes especificar un rango de fechas");
  return await obtenerVentasPorDia(desde, hasta);
}
