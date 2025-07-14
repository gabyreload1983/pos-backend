import { pool } from "../config/db.js";

export async function crearVenta(connection, ventaData) {
  const [ventaResult] = await connection.query(
    `INSERT INTO ventas (cliente_id, usuario_id, caja_id, total, tipo_pago, observaciones)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      ventaData.cliente_id,
      ventaData.usuario_id,
      ventaData.caja_id,
      ventaData.total,
      ventaData.tipo_pago,
      ventaData.observaciones,
    ]
  );

  return ventaResult.insertId;
}

export async function crearDetalleVenta(connection, venta_id, items) {
  const detalles = items.map((i) => [
    venta_id,
    i.articulo_id,
    i.cantidad,
    i.precio_base,
    i.tipo_ajuste || "ninguno",
    i.porcentaje_ajuste || 0.0,
    i.precio_unitario,
    i.moneda_id,
    i.cotizacion_dolar,
  ]);

  await connection.query(
    `INSERT INTO detalle_venta (
       venta_id,
       articulo_id,
       cantidad,
       precio_base,
       tipo_ajuste,
       porcentaje_ajuste,
       precio_unitario,
       moneda_id,
       cotizacion_dolar
     ) VALUES ?`,
    [detalles]
  );
}

export async function obtenerVentaPorId(id) {
  const [ventas] = await pool.query(
    `SELECT v.*, c.nombre AS cliente
     FROM ventas v
     LEFT JOIN clientes c ON v.cliente_id = c.id
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
       v.tipo_pago,
       u.nombre AS usuario,
       c.nombre AS cliente
     FROM ventas v
     JOIN usuarios u ON v.usuario_id = u.id
     LEFT JOIN clientes c ON v.cliente_id = c.id
     ORDER BY v.fecha DESC`
  );

  return rows;
}
