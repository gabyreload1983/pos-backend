import {
  topArticulos,
  ventasPorDia,
} from "../services/estadisticas.service.js";

export async function getVentasPorDia(req, res) {
  try {
    const { desde, hasta } = req.query;
    const data = await ventasPorDia(desde, hasta);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getTopArticulos(req, res) {
  try {
    const { desde, hasta, limite } = req.query;
    const data = await topArticulos(desde, hasta, limite);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
