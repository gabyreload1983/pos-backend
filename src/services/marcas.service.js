import { obtenerMarcas } from "../models/marcas.model.js";

export async function listarMarcas() {
  return await obtenerMarcas();
}
