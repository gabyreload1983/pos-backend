import { pool } from "../config/db.js";

// Buscar usuario por email
export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE email = ? AND activo = 1",
    [email]
  );
  return rows[0];
}

// Buscar usuario por ID
export async function findUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, nombre, email, rol_id, activo, creado_en FROM usuarios WHERE id = ?",
    [id]
  );
  return rows[0];
}

// Crear usuario nuevo
export async function createUser({ nombre, email, password, rol_id }) {
  const [result] = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)`,
    [nombre, email, password, rol_id]
  );
  return result.insertId;
}
