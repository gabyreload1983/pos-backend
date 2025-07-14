import { pool } from "../config/db.js";

export async function obtenerCotizacionDolarActiva() {
  const [rows] = await pool.query(
    `SELECT id, fecha, valor FROM cotizaciones_dolar WHERE activo = 1 ORDER BY fecha DESC LIMIT 1`
  );
  return rows[0] || null;
}
