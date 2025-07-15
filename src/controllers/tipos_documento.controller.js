import { listarTiposDocumento } from "../services/tipos_documento.service.js";

export async function getTiposDocumento(req, res, next) {
  try {
    const tiposDocumento = await listarTiposDocumento();
    res.json(tiposDocumento);
  } catch (error) {
    next(error);
  }
}
