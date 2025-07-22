export async function crearComprobanteElectronico(connection, facturaData) {
  const sql = `
    INSERT INTO comprobantes_electronicos
      (venta_id, tipo_comprobante_id, punto_venta, numero_comprobante, cae, cae_vencimiento, afip_estado_id, afip_response)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    facturaData.ventaId,
    facturaData.tipoComprobanteId,
    facturaData.puntoVenta,
    facturaData.numeroComprobante,
    facturaData.cae,
    facturaData.caeVencimiento,
    facturaData.afipEstadoId,
    facturaData.afipResponse,
  ];
  await connection.query(sql, params);
}
