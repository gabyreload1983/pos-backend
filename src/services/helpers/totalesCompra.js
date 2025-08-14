import { TIPOS_COMPROBANTE } from "../../constants/index.js";

export function calcularTotalNeto({ itemsCompra }) {
  return itemsCompra.reduce(
    (acc, item) => acc + item.costo_unitario_ars * item.cantidad,
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
    total_iva = itemsCompra.reduce((acc, item) => acc + item.monto_iva, 0);
  }

  return total_iva;
}

export function calcularResumenIvaPorAliquota({
  itemsCompra,
  tipoComprobanteId,
}) {
  const aplicaIVA =
    tipoComprobanteId === TIPOS_COMPROBANTE.FA ||
    tipoComprobanteId === TIPOS_COMPROBANTE.FB ||
    tipoComprobanteId === TIPOS_COMPROBANTE.FC;

  const map = new Map(); // key: iva_aliquota_id -> { neto, iva }

  for (const item of itemsCompra) {
    if (!item.iva_aliquota_id) continue; // seguridad

    const neto = item.costo_unitario_ars * item.cantidad;
    const iva = aplicaIVA ? item.monto_iva : 0;

    const acc = map.get(item.iva_aliquota_id) || { neto: 0, iva: 0 };
    acc.neto += neto;
    acc.iva += iva;
    map.set(item.iva_aliquota_id, acc);
  }

  // devolvemos un array listo para insertar
  return Array.from(map.entries()).map(([iva_aliquota_id, { neto, iva }]) => ({
    iva_aliquota_id,
    neto,
    iva,
  }));
}
