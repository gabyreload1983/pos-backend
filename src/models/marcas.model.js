import { pool } from "../config/db.js";

export async function obtenerMarcas() {
  const [rows] = await pool.query(`SELECT * FROM marcas ORDER BY nombre`);
  return rows;
}
