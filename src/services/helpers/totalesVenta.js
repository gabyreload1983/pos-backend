export function calcularTotalNetoVenta({ itemsProcesados }) {
  const total = itemsProcesados.reduce(
    (acc, item) => acc + Number(item.neto_ars || 0),
    0
  );
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

export function calcularTotalIvaVenta({ itemsProcesados }) {
  const total = itemsProcesados.reduce(
    (acc, item) => acc + Number(item.iva_ars || 0),
    0
  );
  return Math.round((total + Number.EPSILON) * 100) / 100;
}
