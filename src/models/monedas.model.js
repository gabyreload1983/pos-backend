import { pool } from "../config/db.js";

export async function obtenerMonedas() {
  const [rows] = await pool.query(`SELECT * FROM monedas ORDER BY nombre`);
  return rows;
}
