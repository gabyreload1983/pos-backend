import { obtenerCotizacionDolarActiva } from "../models/cotizaciones_dolar.model.js";

export async function getCotizacionDolarActual(req, res, next) {
  try {
    const cotizacion = await obtenerCotizacionDolarActiva();
    if (!cotizacion)
      return res.status(404).json({ error: "No hay cotización activa" });
    res.json(cotizacion);
  } catch (error) {
    next(error);
  }
}
