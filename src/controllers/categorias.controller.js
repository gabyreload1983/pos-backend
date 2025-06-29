import { listarCategorias } from "../services/categorias.service.js";

export async function getCategorias(req, res, next) {
  try {
    const categorias = await listarCategorias();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
}
