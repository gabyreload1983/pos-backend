export function calcularPrecioVenta(costo, renta) {
  return parseFloat((costo + (costo * renta) / 100).toFixed(2));
}
