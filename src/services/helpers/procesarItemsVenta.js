// src/services/helpers/procesarItemsVenta.js
import { ApiError } from "../../utils/ApiError.js";
import { obtenerArticulo } from "../../models/articulos.model.js";
import { obtenerStockArticuloSucursal } from "../../models/stock.model.js";
import { calcularPrecioUnitario } from "../../utils/calcularPrecioVenta.js";

export async function procesarItemsVenta(items, sucursal_id, cotizacionActiva) {
  const procesados = [];
  let total = 0;

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
      articulo.moneda_codigo === "USD" ? cotizacionActiva.valor : 1;
    const subtotalARS = precio_unitario * item.cantidad * cotizacion;
    total += subtotalARS;

    procesados.push({
      articulo_id: item.articulo_id,
      cantidad: item.cantidad,
      precio_base: item.precio_base,
      tipo_ajuste_id: item.tipo_ajuste_id,
      porcentaje_ajuste: item.porcentaje_ajuste ?? 0,
      precio_unitario,
      moneda_id: articulo.moneda_id,
      cotizacion_dolar:
        articulo.moneda_codigo === "USD" ? cotizacionActiva.valor : null,
    });
  }

  return { itemsProcesados: procesados, total };
}
