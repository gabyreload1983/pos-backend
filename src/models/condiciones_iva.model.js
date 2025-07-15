import { pool } from "../config/db.js";

export async function obtenerCondicionesIva() {
  const [rows] = await pool.query(
    `SELECT * FROM condiciones_iva WHERE activo = 1 ORDER BY nombre`
  );
  return rows;
}
