import { obtenerTiposDocumento } from "../models/tiposDocumento.model.js";

export async function listarTiposDocumento() {
  return await obtenerTiposDocumento();
}
