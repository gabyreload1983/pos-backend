import { obtenerIvaAliquotas } from "../models/ivaAliquotas.model.js";

export async function listarIvaAliquotas() {
  return await obtenerIvaAliquotas();
}
