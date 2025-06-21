
import { registrarPago } from '../services/pagos.service.js';

export async function postPago(req, res) {
  try {
    const id = await registrarPago(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar el pago' });
  }
}
