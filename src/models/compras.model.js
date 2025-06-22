import { pool } from "../config/db";

export async function crearCompra(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO compras (usuario_id, proveedor_id, sucursal_id, fecha, tipo_comprobante, nro_comprobante, total, observaciones, tipo_pago)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.usuario_id,
      data.proveedor_id,
      data.sucursal_id,
      data.fecha,
      data.tipo_comprobante,
      data.nro_comprobante,
      data.total,
      data.observaciones || null,
      data.tipo_pago || "contado",
    ]
  );
  return result.insertId;
}

export async function insertarDetalleCompra(connection, compra_id, items) {
  for (const item of items) {
    await connection.query(
      `INSERT INTO detalle_compra (compra_id, articulo_id, cantidad, costo, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [
        compra_id,
        item.articulo_id,
        item.cantidad,
        item.costo,
        item.cantidad * item.costo,
      ]
    );
  }
}

export async function obtenerCompras() {
  const [rows] = await pool.query(`
    SELECT c.id, c.fecha, c.tipo_comprobante, c.nro_comprobante, c.total, c.tipo_pago,
           u.nombre AS usuario, p.nombre AS proveedor
    FROM compras c
    JOIN usuarios u ON c.usuario_id = u.id
    JOIN proveedores p ON c.proveedor_id = p.id
    ORDER BY c.fecha DESC, c.id DESC
  `);
  return rows;
}

export async function obtenerCompraPorId(id) {
  const [cabecera] = await pool.query(
    `SELECT c.*, u.nombre AS usuario, p.nombre AS proveedor
     FROM compras c
     JOIN usuarios u ON c.usuario_id = u.id
     JOIN proveedores p ON c.proveedor_id = p.id
     WHERE c.id = ?`,
    [id]
  );

  const [detalle] = await pool.query(
    `SELECT d.*, a.descripcion AS articulo
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
