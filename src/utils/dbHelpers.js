import { pool } from "../config/db.js";

export async function existeEnTabla(tabla, id) {
  const [rows] = await pool.query(`SELECT id FROM ${tabla} WHERE id = ?`, [id]);
  return rows.length > 0;
}
