import { afip } from "../config/afip/afipConfig.js";

export async function emitirFacturaAFIP({
  ventaId,
  tipoComprobanteId,
  puntoVenta,
  items,
  total,
  total_iva,
}) {
  try {
    // 1. Obtener último número de comprobante
    const ultimoNumero = await afip.ElectronicBilling.getLastVoucher(
      puntoVenta,
      tipoComprobanteId
    );
    const fecha = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];

    // 2. Preparar datos de la factura
    const facturaData = {
      CantReg: 1, // Cantidad de comprobantes a registrar
      PtoVta: 1, // Punto de venta
      CbteTipo: 6, // Tipo de comprobante (ver tipos disponibles)
      Concepto: 1, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
      DocTipo: 99, // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
      DocNro: 0, // Número de documento del comprador (0 consumidor final)
      CbteDesde: 1, // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
      CbteHasta: 1, // Número de comprobante o numero del último comprobante en caso de ser mas de uno
      CbteFch: parseInt(fecha.replace(/-/g, "")), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
      ImpTotal: 121, // Importe total del comprobante
      ImpTotConc: 0, // Importe neto no gravado
      ImpNeto: 100, // Importe neto gravado
      ImpOpEx: 0, // Importe exento de IVA
      ImpIVA: 21, //Importe total de IVA
      ImpTrib: 0, //Importe total de tributos
      MonId: "PES", //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
      MonCotiz: 1, // Cotización de la moneda usada (1 para pesos argentinos)
      CondicionIVAReceptorId: 5, // Condición frente al IVA del receptor (ver tipos disponibles)
      Iva: [
        // (Opcional) Alícuotas asociadas al comprobante
        {
          Id: 5, // Id del tipo de IVA (5 para 21%)(ver tipos disponibles)
          BaseImp: 100, // Base imponible
          Importe: 21, // Importe
        },
      ],
    };

    // 3. Emitir factura
    const resultado = await afip.ElectronicBilling.createVoucher(facturaData);

    return {
      success: true,
      cae: resultado.CAE,
      numeroComprobante: resultado.CbteHasta,
      fechaVencimientoCAE: resultado.CAEFchVto,
    };
  } catch (error) {
    console.error("Error en AFIP Service:", error);
    throw new Error(`Error AFIP: ${error.message}`);
  }
}

function prepararItemsAFIP(items) {
  return items.map((item) => ({
    Id: item.articulo_id,
    Descripcion: item.descripcion.substring(0, 50), // AFIP limita a 50 chars
    Cantidad: item.cantidad,
    PrecioUnitario: item.precio_unitario,
    Importe: item.precio_unitario * item.cantidad,
    Iva: item.monto_iva,
  }));
}

function obtenerFechaActualYYYYMMDD() {
  const hoy = new Date(); // Crea un objeto Date con la fecha y hora actuales

  const año = hoy.getFullYear(); // Obtiene el año (ej: 2025)
  const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Obtiene el mes (0-11) y le suma 1, luego lo formatea a 2 dígitos
  const dia = String(hoy.getDate()).padStart(2, "0"); // Obtiene el día del mes (1-31) y lo formatea a 2 dígitos

  return `${año}${mes}${dia}`; // Combina las partes en el formato YYYYMMDD
}
