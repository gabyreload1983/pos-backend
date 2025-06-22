
import {
  aperturaCaja,
  cierreCaja,
  movimientoCaja,
  movimientosDeCaja
} from '../services/caja.service.js';

export async function abrir(req, res) {
  try {
    const id = await aperturaCaja(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function cerrar(req, res) {
  try {
    const id = await cierreCaja(req.body, req.user.id);
    res.json({ id, message: 'Caja cerrada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function nuevoMovimiento(req, res) {
  try {
    const id = await movimientoCaja(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function listarMovimientos(req, res) {
  try {
    const movimientos = await movimientosDeCaja(req.user.id);
    res.json(movimientos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
