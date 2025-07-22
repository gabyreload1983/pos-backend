export async function crearComprobanteElectronico(connection, facturaData) {
  const sql = `
    INSERT INTO comprobantes_electronicos
      (venta_id, tipo_comprobante_id, punto_venta, numero_comprobante, cae, cae_vencimiento, afip_estado_id, afip_response)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    facturaData.venta_id,
    facturaData.tipo_comprobante_id,
    facturaData.punto_venta,
    facturaData.numero_comprobante,
    facturaData.cae,
    facturaData.cae_vencimiento,
    facturaData.afip_estado_id,
    facturaData.afip_response,
  ];
  await connection.query(sql, params);
}
