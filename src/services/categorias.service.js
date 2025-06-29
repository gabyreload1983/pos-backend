import { obtenerCategorias } from "../models/categorias.model.js";

export async function listarCategorias() {
  return await obtenerCategorias();
}
