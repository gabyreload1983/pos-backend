import { listarMonedas } from "../services/monedas.service.js";

export async function getMonedas(req, res, next) {
  try {
    const monedas = await listarMonedas();
    res.json(monedas);
  } catch (error) {
    next(error);
  }
}
