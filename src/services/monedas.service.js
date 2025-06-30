import { obtenerMonedas } from "../models/monedas.model.js";

export async function listarMonedas() {
  return await obtenerMonedas();
}
