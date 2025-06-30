import { obtenerCondicionesIva } from "../models/condicionesIva.model.js";

export async function listarCondicionesIva() {
  return await obtenerCondicionesIva();
}
