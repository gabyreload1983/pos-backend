import { generarResumenDiario } from "../services/resumen.service.js";

export async function getResumenDiario(req, res, next) {
  try {
    const data = await generarResumenDiario(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
