import { TIPOS_AJUSTE } from "../constants/index.js";

export function calcularPrecioUnitario(
  base,
  tipo_ajuste_id,
  porcentaje_ajuste = 0
) {
  switch (tipo_ajuste_id) {
    case TIPOS_AJUSTE.DESCUENTO:
      return Number((base * (1 - porcentaje_ajuste / 100)).toFixed(2));
    case TIPOS_AJUSTE.RECARGO:
      return Number((base * (1 + porcentaje_ajuste / 100)).toFixed(2));
    default:
      return Number(base.toFixed(2));
  }
}
