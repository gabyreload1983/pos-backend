import { obtenerCondicionesIva } from "../models/condiciones_iva.model.js";

export async function listarCondicionesIva() {
  return await obtenerCondicionesIva();
}
