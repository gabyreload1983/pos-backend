import { pool } from "../config/db.js";

export async function obtenerMonedas() {
  const [rows] = await pool.query(`SELECT * FROM monedas ORDER BY nombre`);
  return rows;
}

export async function obtenerMonedaPorId(moneda_id) {
  const [rows] = await pool.query(
    `SELECT id, nombre, simbolo, codigo_iso FROM monedas WHERE id = ?`,
    [moneda_id]
  );
  return rows[0] || null;
}
