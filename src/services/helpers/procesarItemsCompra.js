import { MONEDAS } from "../../constants/index.js";
import { obtenerArticulo } from "../../models/articulos.model.js";
import { ApiError } from "../../utils/ApiError.js";

export async function procesarItemsCompra({ itemsBrutos, cotizacionDolar }) {
  const errores = [];

  // 1. Validar y recoger moneda de cada artículo
  const itemsConMonedas = await Promise.all(
    itemsBrutos.map(async (item, i) => {
      const articulo = await obtenerArticulo(item.articulo_id);
      if (!articulo) {
        errores.push({
          campo: `items[${i}].articulo_id`,
          mensaje: `ID: ${item.articulo_id} de Artículo no válido`,
        });
        return null;
      }

      return {
        ...articulo,
        articulo_id: articulo.id,
        cantidad: item.cantidad,
        costo_unitario: item.costo_unitario,
        series: item.series ?? [],
        cotizacion_dolar:
          item.moneda_id !== MONEDAS.ARS ? cotizacionDolar : null,
      };
    })
  );

  if (errores.length) throw ApiError.validation(errores);

  return itemsConMonedas;
}
