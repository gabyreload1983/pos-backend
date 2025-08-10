import { ApiError } from "../../utils/ApiError.js";
import { obtenerArticulo } from "../../models/articulos.model.js";
import { obtenerStockArticuloSucursal } from "../../models/stock.model.js";
import { calcularPrecioUnitario } from "../../utils/calcularPrecioVenta.js";
import { obtenerEstadoSerie } from "../../utils/dbHelpers.js";
import { ESTADOS_NUMEROS_SERIE } from "../../constants/index.js";

export async function procesarItemsVenta({
  items,
  sucursal_id,
  cotizacionActiva,
  requiere_afip = false,
}) {
  const procesados = [];
  let total = 0;
  let total_iva = 0;

  for (const item of items) {
    const articulo = await obtenerArticulo(item.articulo_id);
    if (!articulo)
      throw new ApiError(`Artículo ID ${item.articulo_id} no válido`, 400);

    if (articulo.controla_stock) {
      const stock = await obtenerStockArticuloSucursal(
        item.articulo_id,
        sucursal_id
      );
      if (!stock || stock.cantidad < item.cantidad) {
        throw new ApiError(
          `Stock insuficiente para ${articulo.nombre} (stock: ${
            stock?.cantidad || 0
          })`,
          400
        );
      }
    }

    if (articulo.tiene_nro_serie) {
      for (const serie of item?.series) {
        const result = await obtenerEstadoSerie(
          item.articulo_id,
          sucursal_id,
          serie
        );
        if (!result || result?.estado_id !== ESTADOS_NUMEROS_SERIE.DISPONIBLE)
          throw new ApiError(
            `Serie ${serie} de ${articulo.nombre} no disponible`,
            400
          );
      }
    }

    const precio_unitario = calcularPrecioUnitario(
      item.precio_base,
      item.tipo_ajuste_id,
      item.porcentaje_ajuste ?? 0
    );

    if (precio_unitario < Number(articulo.costo)) {
      throw new ApiError(
        `El precio final ($${precio_unitario}) es menor al costo ($${articulo.costo}) para ${articulo.nombre}`,
        400
      );
    }

    const cotizacion =
      articulo.moneda_codigo === "USD" ? cotizacionActiva.valor : 1; //TODO: refactorizar a cotizaciones_monedas
    const subtotalARS = precio_unitario * item.cantidad * cotizacion;

    let porcentaje_iva = null;
    let monto_iva = null;

    if (requiere_afip && articulo.porcentaje_iva != null) {
      porcentaje_iva = parseFloat(articulo.porcentaje_iva);
      const monto_iva_unitario = precio_unitario * (porcentaje_iva / 100);
      monto_iva = parseFloat((monto_iva_unitario * item.cantidad).toFixed(2));
      total_iva += monto_iva;
    }

    total += subtotalARS;

    procesados.push({
      articulo_id: item.articulo_id,
      descripcion: articulo.nombre,
      cantidad: item.cantidad,
      series: item?.series || [],
      precio_base: item.precio_base,
      tipo_ajuste_id: item.tipo_ajuste_id,
      porcentaje_ajuste: item.porcentaje_ajuste ?? 0,
      precio_unitario,
      moneda_id: articulo.moneda_id,
      tasa_cambio:
        articulo.moneda_codigo === "USD" ? cotizacionActiva.valor : null, //TODO: refactorizar a cotizaciones_monedas
      porcentaje_iva,
      monto_iva,
    });
  }

  return {
    itemsProcesados: procesados,
    total: parseFloat(total.toFixed(2)),
    total_iva: parseFloat(total_iva.toFixed(2)),
  };
}
