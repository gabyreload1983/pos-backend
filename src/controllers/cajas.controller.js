import {
  aperturaCaja,
  cierreCaja,
  movimientoCaja,
  movimientosDeCaja,
} from "../services/cajas.service.js";

export async function abrir(req, res, next) {
  try {
    const id = await aperturaCaja(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}

export async function cerrar(req, res, next) {
  try {
    const id = await cierreCaja(req.body, req.user.id);
    res.json({ id, message: "Caja cerrada" });
  } catch (error) {
    next(error);
  }
}

export async function nuevoMovimiento(req, res, next) {
  try {
    const id = await movimientoCaja(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}

export async function listarMovimientos(req, res, next) {
  try {
    const movimientos = await movimientosDeCaja(req.user.id);
    res.json(movimientos);
  } catch (error) {
    next(error);
  }
}
