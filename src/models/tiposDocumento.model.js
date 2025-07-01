import { pool } from "../config/db.js";

export async function obtenerTiposDocumento() {
  const [rows] = await pool.query(
    `SELECT * FROM tipos_documento WHERE activo = 1 ORDER BY nombre`
  );
  return rows;
}
