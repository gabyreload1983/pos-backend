import {
  listarMovimientos,
  listarMovimientosFiltrados,
  nuevoMovimiento,
} from "../services/cuentas_corrientes.service.js";

export async function getMovimientos(req, res, next) {
  try {
    const cliente_id = req.params.id;
    const data = await listarMovimientos(cliente_id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function postMovimiento(req, res, next) {
  try {
    const id = await nuevoMovimiento(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}

export async function getMovimientosFiltrados(req, res, next) {
  try {
    const cliente_id = req.params.id;
    const { desde, hasta } = req.query;

    const data = await listarMovimientosFiltrados(cliente_id, desde, hasta);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
