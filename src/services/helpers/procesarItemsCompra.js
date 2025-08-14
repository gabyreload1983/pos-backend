import { MONEDAS } from "../../constants/index.js";
import { obtenerArticulo } from "../../models/articulos.model.js";
import { ApiError } from "../../utils/ApiError.js";

export async function procesarItemsCompra({ itemsBrutos, tasaCambio }) {
  const errores = [];
  const itemsCompra = [];

  for (let item of itemsBrutos) {
    const articulo = await obtenerArticulo(item.articulo_id);

    if (!articulo) {
      errores.push({
        campo: `items[${item.articulo_id}].articulo_id`,
        mensaje: `ID: ${item.articulo_id} no válido`,
      });
      continue;
    }

    if (articulo.tiene_nro_serie) {
      const series = item.series ?? [];
      if (series.length !== item.cantidad) {
        errores.push({
          campo: `series del artículo ${item.articulo_id}`,
          mensaje: `Cantidad de series (${series.length}) no coincide con la cantidad comprada (${item.cantidad}) para el artículo ID ${item.articulo_id}`,
        });
        continue;
      }
    }

    const necesitaCotizacion = articulo.moneda_id !== MONEDAS.ARS;

    const costo_unitario_ars = Number(item.costo_unitario);

    const costo_unitario_moneda = necesitaCotizacion
      ? costo_unitario_ars / tasaCambio
      : costo_unitario_ars;

    itemsCompra.push({
      articulo_id: articulo.id,
      cantidad: Number(item.cantidad),
      costo_unitario_ars,
      costo_unitario_moneda,
      porcentaje_iva: +articulo.porcentaje_iva,
      monto_iva:
        (costo_unitario_ars * item.cantidad * articulo.porcentaje_iva) / 100,
      moneda_id: articulo.moneda_id,
      tasa_cambio: tasaCambio,
      tiene_nro_serie: articulo.tiene_nro_serie,
      series: item.series ?? [],
    });
  }

  if (errores.length) throw ApiError.validation(errores);
  return itemsCompra;
}
