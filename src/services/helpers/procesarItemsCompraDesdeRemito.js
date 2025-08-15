import { MONEDAS, TIPOS_COMPROBANTE } from "../../constants/index.js";
import { obtenerArticulo } from "../../models/articulos.model.js";
import { obtenerCantidadesRemitadasPorArticulo } from "../../models/compras.model.js";
import { ApiError } from "../../utils/ApiError.js";

export async function procesarItemsCompraDesdeRemitos({
  connection,
  data,
  itemsBrutos,
  tasaCambio,
}) {
  const cantidadesRows = await obtenerCantidadesRemitadasPorArticulo({
    connection,
    remitos_id: data.remitos_id,
  });
  const cantidadesMap = new Map(
    cantidadesRows.map((r) => [Number(r.articulo_id), Number(r.cantidad)])
  );

  const itemsCompra = [];
  const errores = [];

  for (const itemCosto of itemsBrutos) {
    const articulo_id = Number(itemCosto.articulo_id);
    const cantidad = cantidadesMap.get(articulo_id);

    if (!cantidad) {
      errores.push({
        campo: `items[articulo_id=${articulo_id}]`,
        mensaje: `No se encontró cantidad remitida para el artículo`,
      });
      continue;
    }

    const art = await obtenerArticulo(articulo_id);
    if (!art) {
      errores.push({
        campo: `items[articulo_id=${articulo_id}]`,
        mensaje: `Artículo inexistente`,
      });
      continue;
    }

    const costo_unitario_ars = Number(itemCosto.costo_unitario);
    const necesitaCotizacion = art.moneda_id !== MONEDAS.ARS;
    const costo_unitario_moneda = necesitaCotizacion
      ? costo_unitario_ars / tasaCambio
      : costo_unitario_ars;

    const porcentaje_iva = +art.porcentaje_iva || 0;
    const monto_iva = (costo_unitario_ars * cantidad * porcentaje_iva) / 100;

    itemsCompra.push({
      articulo_id,
      cantidad,
      costo_unitario_ars,
      costo_unitario_moneda,
      porcentaje_iva,
      monto_iva: aplicaIVA(data.tipo_comprobante_id) ? monto_iva : 0,
      moneda_id: art.moneda_id,
      tasa_cambio: tasaCambio,
      tiene_nro_serie: !!art.tiene_nro_serie,
      series: [],
      iva_aliquota_id: art.iva_aliquota_id,
    });
  }

  if (errores.length) throw ApiError.validation(errores);

  return itemsCompra;
}

function aplicaIVA(tipoComprobanteId) {
  return (
    tipoComprobanteId === TIPOS_COMPROBANTE.FA ||
    tipoComprobanteId === TIPOS_COMPROBANTE.FB ||
    tipoComprobanteId === TIPOS_COMPROBANTE.FC
  );
}
