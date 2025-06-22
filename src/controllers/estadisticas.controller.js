import { ventasPorDia } from "../services/estadisticas.service.js";

export async function getVentasPorDia(req, res) {
  try {
    const { desde, hasta } = req.query;
    const data = await ventasPorDia(desde, hasta);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
