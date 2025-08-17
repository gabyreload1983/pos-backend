import { ApiError } from "../../utils/ApiError.js";
import { obtenerArticulo } from "../../models/articulos.model.js";
import { obtenerStockArticuloSucursal } from "../../models/stock.model.js";
import { calcularPrecioUnitario } from "../../utils/calcularPrecioVenta.js";
import { obtenerEstadoSerie } from "../../utils/dbHelpers.js";
import {
  ESTADOS_NUMEROS_SERIE,
  MONEDAS,
  TIPOS_AJUSTE,
} from "../../constants/index.js";

const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export async function procesarItemsVenta({
  items,
  sucursal_id,
  cotizacionActiva,
}) {
  const itemsProcesados = [];
  const cotizacion = cotizacionActiva.valor;

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
      if (!Array.isArray(item.series) || item.series.length !== item.cantidad) {
        throw new ApiError(
          `Debés informar ${item.cantidad} series para ${articulo.nombre}`,
          400
        );
      }
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

    let precio_final_ars;

    if (item.tipo_ajuste_id === TIPOS_AJUSTE.MANUAL)
      precio_final_ars = Number(item.precio_base);

    if (item.tipo_ajuste_id !== TIPOS_AJUSTE.MANUAL) {
      let precio_calculado = calcularPrecioUnitario(
        Number(articulo.precio_venta),
        item.tipo_ajuste_id,
        item.porcentaje_ajuste || 0
      );

      if (articulo.moneda_id !== MONEDAS.ARS)
        precio_final_ars = precio_calculado * Number(cotizacion);

      if (articulo.moneda_id === MONEDAS.ARS)
        precio_final_ars = precio_calculado;
    }

    let precio_final_moneda =
      articulo.moneda_id === MONEDAS.ARS
        ? precio_final_ars
        : precio_final_ars / Number(cotizacion);

    if (precio_final_moneda < Number(articulo.costo)) {
      throw new ApiError(
        `El precio final ($${precio_final_moneda}) es menor al costo ($${articulo.costo}) para ${articulo.nombre}`,
        400
      );
    }

    const neto_ars = r2(precio_final_ars * item.cantidad);
    const porcentaje_iva =
      articulo.porcentaje_iva != null ? Number(articulo.porcentaje_iva) : null;
    const iva_ars =
      porcentaje_iva != null ? r2(neto_ars * (porcentaje_iva / 100)) : 0;

    itemsProcesados.push({
      articulo_id: articulo.id,
      cantidad: item.cantidad,
      precio_final_moneda,
      precio_final_ars,
      tipo_ajuste_id: item.tipo_ajuste_id,
      porcentaje_ajuste: item.porcentaje_ajuste || 0,
      moneda_id: articulo.moneda_id,
      tasa_cambio: articulo.moneda_id !== MONEDAS.ARS ? Number(cotizacion) : 1,
      porcentaje_iva,
      iva_ars,
      neto_ars,
    });
  }

  return {
    itemsProcesados,
  };
}
