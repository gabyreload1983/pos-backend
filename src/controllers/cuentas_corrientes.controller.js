import {
  listarMovimientos,
  nuevoMovimiento,
} from "../services/cuentas_corrientes.service.js";

export async function getMovimientos(req, res) {
  try {
    const cliente_id = req.params.id;
    const data = await listarMovimientos(cliente_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los movimientos" });
  }
}

export async function postMovimiento(req, res) {
  try {
    const id = await nuevoMovimiento(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: "Error al registrar el movimiento" });
  }
}
