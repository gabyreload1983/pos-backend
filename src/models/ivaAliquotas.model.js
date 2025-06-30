import { pool } from "../config/db.js";

export async function obtenerIvaAliquotas() {
  const [rows] = await pool.query(
    `SELECT * FROM iva_aliquotas WHERE activo = 1 ORDER BY porcentaje`
  );
  return rows;
}
