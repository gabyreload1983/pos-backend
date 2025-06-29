import { pool } from "../config/db.js";

export async function obtenerCategorias() {
  const [rows] = await pool.query(`SELECT * FROM categorias ORDER BY nombre`);
  return rows;
}
