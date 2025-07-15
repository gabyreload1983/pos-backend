import { obtenerTiposDocumento } from "../models/tipos_documento.model.js";

export async function listarTiposDocumento() {
  return await obtenerTiposDocumento();
}
