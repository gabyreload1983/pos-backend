import { MONEDAS } from "../../constants/index.js";
import { obtenerArticulo } from "../../models/articulos.model.js";
import { ApiError } from "../../utils/ApiError.js";

export async function procesarItemsCompra({ itemsBrutos, tasaCambio }) {
  const errores = [];
  const itemsOk = [];

  for (let item of itemsBrutos) {
    const articulo = await obtenerArticulo(item.articulo_id);

    if (!articulo) {
      errores.push({
        campo: `items[${i}].articulo_id`,
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

    if (necesitaCotizacion && !tasaCambio) {
      errores.push({
        campo: "tasa_cambio",
        mensaje: `Falta cotización para artículo ${item.articulo_id} en moneda ${articulo.moneda_id}`,
      });
      continue;
    }

    const costoCompraArs = Number(item.costo_unitario);

    const costoCompraMoneda = necesitaCotizacion
      ? costoCompraArs / tasaCambio
      : costoCompraArs;

    itemsOk.push({
      articulo_id: articulo.id,
      cantidad: Number(item.cantidad),
      costo_unitario: costoCompraMoneda,
      moneda_id: articulo.moneda_id,
      tasa_cambio: tasaCambio,
      tiene_nro_serie: articulo.tiene_nro_serie,
      series: item.series ?? [],
    });
  }

  if (errores.length) throw ApiError.validation(errores);
  return itemsOk;
}
