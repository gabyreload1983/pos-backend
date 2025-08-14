import { TIPOS_COMPROBANTE } from "../../constants/index.js";

export function calcularTotalNeto({ itemsCompra }) {
  return itemsCompra.reduce(
    (acc, it) => acc + it.costo_unitario_ars * it.cantidad,
    0
  );
}

export function calcularTotalIva({ itemsCompra, tipoComprobanteId }) {
  let total_iva = 0;
  if (
    tipoComprobanteId === TIPOS_COMPROBANTE.FA ||
    tipoComprobanteId === TIPOS_COMPROBANTE.FB ||
    tipoComprobanteId === TIPOS_COMPROBANTE.FC
  ) {
    total_iva = itemsCompra.reduce((acc, it) => acc + (it.monto_iva || 0), 0);
  }

  return total_iva;
}
