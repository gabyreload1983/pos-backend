
import { pool } from "../config/db.js";

export async function crearCompra(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO compras (
      usuario_id, proveedor_id, sucursal_id,
      tipo_comprobante_id, punto_venta, numero_comprobante,
      total, observaciones
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.usuario_id,
      data.proveedor_id,
      data.sucursal_id,
      data.tipo_comprobante_id,
      data.punto_venta || null,
      data.numero_comprobante || null,
      data.total,
      data.observaciones || null
    ]
  );
  return result.insertId;
}

export async function insertarDetalleCompra(connection, compra_id, items) {
  for (const item of items) {
    await connection.query(
      `INSERT INTO detalle_compra (
        compra_id, articulo_id, cantidad,
        costo_unitario, moneda_id, cotizacion_dolar
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        compra_id,
        item.articulo_id,
        item.cantidad,
        item.costo_unitario,
        item.moneda_id,
        item.cotizacion_dolar || null
      ]
    );
  }
}

export async function insertarDetalleCompraSeries(connection, detalle_compra_id, series) {
  const values = series.map((serie) => [detalle_compra_id, serie]);
  await connection.query(
    "INSERT INTO detalle_compra_series (detalle_compra_id, nro_serie) VALUES ?",
    [values]
  );
}

export async function obtenerCompras() {
  const [rows] = await pool.query(`
    SELECT c.id, c.fecha, tc.nombre AS tipo_comprobante, c.numero_comprobante, c.total,
           u.nombre AS usuario, p.nombre AS proveedor
    FROM compras c
    JOIN tipos_comprobante tc ON c.tipo_comprobante_id = tc.id
    JOIN usuarios u ON c.usuario_id = u.id
    JOIN proveedores p ON c.proveedor_id = p.id
    ORDER BY c.fecha DESC, c.id DESC
  `);
  return rows;
}

export async function obtenerCompraPorId(id) {
  const [cabecera] = await pool.query(
    `SELECT c.*, tc.nombre AS tipo_comprobante, u.nombre AS usuario, p.nombre AS proveedor
     FROM compras c
     JOIN tipos_comprobante tc ON c.tipo_comprobante_id = tc.id
     JOIN usuarios u ON c.usuario_id = u.id
     JOIN proveedores p ON c.proveedor_id = p.id
     WHERE c.id = ?`,
    [id]
  );

  const [detalle] = await pool.query(
    `SELECT d.*, a.nombre AS articulo
     FROM detalle_compra d
     JOIN articulos a ON d.articulo_id = a.id
     WHERE d.compra_id = ?`,
    [id]
  );

  return {
    ...cabecera[0],
    items: detalle,
  };
}
