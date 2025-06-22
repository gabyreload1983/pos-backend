import {
  obtenerTopArticulos,
  obtenerTopClientes,
  obtenerVentasPorDia,
} from "../models/estadisticas.model.js";

export async function ventasPorDia(desde, hasta) {
  if (!desde || !hasta) throw new Error("Debes especificar un rango de fechas");
  return await obtenerVentasPorDia(desde, hasta);
}

export async function topArticulos(desde, hasta, limite = 10) {
  if (!desde || !hasta) throw new Error("Rango de fechas requerido");
  return await obtenerTopArticulos(desde, hasta, limite);
}

export async function topClientes(desde, hasta, limite = 10) {
  if (!desde || !hasta) throw new Error("Debes especificar un rango de fechas");
  return await obtenerTopClientes(desde, hasta, limite);
}
