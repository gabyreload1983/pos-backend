import { pool } from "../config/db.js";

export async function obtenerCotizacionActiva() {
  const [rows] = await pool.query(
    `SELECT id, moneda_id, fecha, valor, fuente FROM cotizaciones_monedas WHERE activo = 1 ORDER BY fecha DESC LIMIT 1`
  );
  return rows[0] || null;
}
