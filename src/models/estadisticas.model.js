import { pool } from "../config/db.js";

export async function obtenerVentasPorDia(desde, hasta) {
  const [rows] = await pool.query(
    `SELECT DATE(fecha) AS fecha, tipo_pago, SUM(total) AS total
     FROM ventas
     WHERE fecha BETWEEN ? AND ?
     GROUP BY DATE(fecha), tipo_pago
     ORDER BY fecha ASC`,
    [desde, hasta]
  );
  return rows;
}
