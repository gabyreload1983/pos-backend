import { listarIvaAliquotas } from "../services/iva_aliquotas.service.js";

export async function getIvaAliquotas(req, res, next) {
  try {
    const ivas = await listarIvaAliquotas();
    res.json(ivas);
  } catch (error) {
    next(error);
  }
}
