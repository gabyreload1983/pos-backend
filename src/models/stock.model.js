import { pool } from '../config/db.js';

export async function obtenerStockPorSucursal() {
  const [rows] = await pool.query(`
    SELECT s.id, a.nombre AS articulo, su.nombre AS sucursal, s.cantidad
    FROM stock s
    JOIN articulos a ON s.articulo_id = a.id
    JOIN sucursales su ON s.sucursal_id = su.id
    ORDER BY su.nombre, a.nombre
  `);
  return rows;
}

export async function ajustarStock({ articulo_id, sucursal_id, cantidad }) {
  const [rows] = await pool.query(`
    UPDATE stock SET cantidad = ? 
    WHERE articulo_id = ? AND sucursal_id = ?`, 
    [cantidad, articulo_id, sucursal_id]
  );
  return rows.affectedRows;
}

export async function obtenerStockArticuloSucursal(articulo_id, sucursal_id) {
  const [rows] = await pool.query(
    `SELECT * FROM stock WHERE articulo_id = ? AND sucursal_id = ?`,
    [articulo_id, sucursal_id]
  );
  return rows[0];
}

export async function crearRegistroStock({ articulo_id, sucursal_id, cantidad }) {
  const [result] = await pool.query(
    `INSERT INTO stock (articulo_id, sucursal_id, cantidad) VALUES (?, ?, ?)`,
    [articulo_id, sucursal_id, cantidad]
  );
  return result.insertId;
}
