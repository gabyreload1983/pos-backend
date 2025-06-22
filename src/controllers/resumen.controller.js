
import { generarResumenDiario } from '../services/resumen.service.js';

export async function getResumenDiario(req, res) {
  try {
    const data = await generarResumenDiario(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
