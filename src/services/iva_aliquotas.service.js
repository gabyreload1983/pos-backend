import { obtenerIvaAliquotas } from "../models/iva_aliquotas.model.js";

export async function listarIvaAliquotas() {
  return await obtenerIvaAliquotas();
}
