import { registrarPago } from "../services/pagos.service.js";

export async function postPago(req, res, next) {
  try {
    const id = await registrarPago(req.body, req.user.id, req.user.sucursal_id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}
