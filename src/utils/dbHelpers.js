import { pool } from "../config/db.js";

export async function existeEnTabla(tabla, id) {
  const [rows] = await pool.query(`SELECT id FROM ${tabla} WHERE id = ?`, [id]);
  return rows.length > 0;
}

export async function existeComprobanteProveedor(
  proveedor_id,
  punto_venta,
  numero_comprobante
) {
  const [rows] = await pool.query(
    `SELECT id FROM compras
     WHERE proveedor_id = ? AND punto_venta = ? AND numero_comprobante = ?`,
    [proveedor_id, punto_venta, numero_comprobante]
  );
  return rows.length > 0;
}
