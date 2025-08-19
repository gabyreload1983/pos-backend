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
  const cotizacion = Number(cotizacionActiva?.valor ?? 0);

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

    if (articulo.moneda_id !== MONEDAS.ARS && !(cotizacion > 0)) {
      throw new ApiError(
        `No hay cotización activa válida para la moneda del artículo ${articulo.nombre}`,
        400
      );
    }

    let precio_base_moneda;
    let precio_unitario_moneda;

    if (item.tipo_ajuste_id === TIPOS_AJUSTE.MANUAL) {
      const precioManualARS = Number(item.precio_base);
      if (!Number.isFinite(precioManualARS) || precioManualARS <= 0) {
        throw new ApiError(
          `En modo MANUAL, precio_base debe ser un número mayor a 0`,
          400
        );
      }
      item.porcentaje_ajuste = 0;

      if (articulo.moneda_id === MONEDAS.ARS) {
        precio_base_moneda = precioManualARS;
        precio_unitario_moneda = precioManualARS;
      }
      if (articulo.moneda_id !== MONEDAS.ARS) {
        precio_base_moneda = precioManualARS / cotizacion;
        precio_unitario_moneda = precio_base_moneda;
      }
    }

    if (item.tipo_ajuste_id !== TIPOS_AJUSTE.MANUAL) {
      precio_base_moneda = Number(articulo.precio_venta);
      if (!Number.isFinite(precio_base_moneda) || precio_base_moneda < 0) {
        throw new ApiError(
          `Precio de lista inválido para ${articulo.nombre}`,
          400
        );
      }

      const porc = Number(item.porcentaje_ajuste || 0);
      if (item.tipo_ajuste_id === TIPOS_AJUSTE.NINGUNO && porc !== 0) {
        throw new ApiError(
          `Con ajuste NINGUNO, porcentaje_ajuste debe ser 0`,
          400
        );
      }
      if (
        (item.tipo_ajuste_id === TIPOS_AJUSTE.DESCUENTO ||
          item.tipo_ajuste_id === TIPOS_AJUSTE.RECARGO) &&
        porc <= 0
      ) {
        throw new ApiError(`Debe indicar un porcentaje_ajuste mayor a 0`, 400);
      }

      precio_unitario_moneda = calcularPrecioUnitario(
        precio_base_moneda,
        item.tipo_ajuste_id,
        porc
      );
    }

    if (precio_unitario_moneda < Number(articulo.costo)) {
      throw new ApiError(
        `El precio final ($${precio_unitario_moneda}) es menor al costo ($${articulo.costo}) para ${articulo.nombre}`,
        400
      );
    }

    const precio_unitario_ars =
      articulo.moneda_id === MONEDAS.ARS
        ? r2(precio_unitario_moneda)
        : r2(precio_unitario_moneda * cotizacion);

    const neto_ars = r2(precio_unitario_ars * item.cantidad);

    const porcentaje_iva =
      articulo.porcentaje_iva != null ? Number(articulo.porcentaje_iva) : null;
    const monto_iva =
      porcentaje_iva != null ? r2(neto_ars * (porcentaje_iva / 100)) : 0;

    itemsProcesados.push({
      articulo_id: articulo.id,
      cantidad: item.cantidad,

      precio_unitario_ars,
      neto_ars,

      precio_unitario_moneda,
      precio_base_moneda,
      tipo_ajuste_id: item.tipo_ajuste_id,
      porcentaje_ajuste: Number(item.porcentaje_ajuste || 0),

      iva_aliquota_id: articulo.iva_aliquota_id,
      moneda_id: articulo.moneda_id,
      tasa_cambio: articulo.moneda_id !== MONEDAS.ARS ? cotizacion : 1,

      porcentaje_iva,
      monto_iva,

      series: item.series ?? [],
    });
  }

  return {
    itemsProcesados,
  };
}
