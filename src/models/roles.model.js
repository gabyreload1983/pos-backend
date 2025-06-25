// src/models/roles.model.js
import { pool } from "../config/db.js";

export async function findRolById(id) {
  const [rows] = await pool.query("SELECT id FROM roles WHERE id = ?", [id]);
  return rows[0];
}
