import { listarCondicionesIva } from "../services/condiciones_iva.service.js";

export async function getCondicionesIva(req, res, next) {
  try {
    const condiciones = await listarCondicionesIva();
    res.json(condiciones);
  } catch (error) {
    next(error);
  }
}
