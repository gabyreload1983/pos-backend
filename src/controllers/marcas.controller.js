import { listarMarcas } from "../services/marcas.service.js";

export async function getMarcas(req, res, next) {
  try {
    const marcas = await listarMarcas();
    res.json(marcas);
  } catch (error) {
    next(error);
  }
}
