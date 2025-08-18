import { pool } from "../config/db.js";

export async function crearVenta({ connection, ventaData }) {
  const [ventaResult] = await connection.query(
    `INSERT INTO ventas (
        cliente_id,
        usuario_id,
        caja_id,
        total,
        total_iva,
        tipo_pago_id,
        observaciones
     )
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      ventaData.cliente_id,
      ventaData.usuario_id,
      ventaData.caja_id,
      ventaData.total,
      ventaData.total_iva,
      ventaData.tipo_pago_id,
      ventaData.observaciones,
    ]
  );

  return ventaResult.insertId;
}

export async function crearDetalleVenta({ connection, venta_id, items }) {
  const rows = items.map((i) => [
    venta_id,
    i.articulo_id,
    i.cantidad,
    Number(i.precio_final_ars),
    i.precio_final_moneda ?? null,
    i.precio_base_moneda ?? null,
    i.tipo_ajuste_id || 1,
    Number(i.porcentaje_ajuste || 0),
    i.moneda_id,
    i.tasa_cambio ?? null,
    i.porcentaje_iva ?? null,
    Number(i.iva_ars || 0),
  ]);

  await connection.query(
    `INSERT INTO detalle_venta (
       venta_id, articulo_id, cantidad,
       precio_unitario_ars,
       precio_unitario_moneda, precio_base_moneda, tipo_ajuste_id, porcentaje_ajuste,
       moneda_id, tasa_cambio,
       porcentaje_iva, monto_iva
     ) VALUES ?`,
    [rows]
  );
}

export async function obtenerVentaPorId(id) {
  const [ventas] = await pool.query(
    `SELECT 
       v.*, c.nombre AS cliente,
       ce.tipo_comprobante_id,
       ce.punto_venta,
       ce.numero_comprobante,
       ce.cae,
       ce.cae_vencimiento,
       ce.afip_estado_id,
       ce.afip_response
     FROM ventas v
     LEFT JOIN clientes c ON v.cliente_id = c.id
     LEFT JOIN comprobantes_electronicos ce ON ce.venta_id = v.id
     WHERE v.id = ?`,
    [id]
  );

  const [detalle] = await pool.query(
    `SELECT 
       d.*,
       a.nombre AS articulo,
       m.nombre AS moneda,
       m.simbolo AS simbolo_moneda
     FROM detalle_venta d
     JOIN articulos a ON d.articulo_id = a.id
     JOIN monedas m ON d.moneda_id = m.id
     WHERE d.venta_id = ?`,
    [id]
  );

  if (ventas.length === 0) return null;

  return { ...ventas[0], detalle };
}

export async function obtenerVentas() {
  const [rows] = await pool.query(
    `SELECT
       v.id,
       v.fecha,
       v.total,
       tp.nombre AS tipo_pago,
       u.nombre AS usuario,
       c.nombre AS cliente,
       CASE 
         WHEN ce.id IS NOT NULL THEN 'electronico' 
         ELSE 'no-electronico' 
       END AS tipo_venta
     FROM ventas v
     JOIN usuarios u ON v.usuario_id = u.id
     JOIN tipos_pago tp ON v.tipo_pago_id = tp.id
     LEFT JOIN clientes c ON v.cliente_id = c.id
     LEFT JOIN comprobantes_electronicos ce 
     ON ce.venta_id = v.id
     ORDER BY v.fecha DESC`
  );

  return rows;
}
