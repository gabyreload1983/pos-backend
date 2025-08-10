import { obtenerCotizacionActiva } from "../models/cotizacionesMonedas.model.js";

export async function getCotizacionActual(req, res, next) {
  try {
    const cotizacion = await obtenerCotizacionActiva();
    if (!cotizacion)
      return res.status(404).json({ error: "No hay cotización activa" });
    res.json(cotizacion);
  } catch (error) {
    next(error);
  }
}
