import { pool } from "../config/db.js";

export async function obtenerTodos() {
  const [rows] = await pool.query("SELECT * FROM proveedores");
  return rows;
}

export async function obtenerPorId(id) {
  const [rows] = await pool.query("SELECT * FROM proveedores WHERE id = ?", [
    id,
  ]);
  return rows[0];
}

export async function crearProveedor(data) {
  const proveedor = {
    ...data,
    activo: 1,
  };
  const [result] = await pool.query("INSERT INTO proveedores SET ?", [
    proveedor,
  ]);
  return result.insertId;
}

export async function modificarProveedor(id, data) {
  const [result] = await pool.query("UPDATE proveedores SET ? WHERE id = ?", [
    data,
    id,
  ]);
  return result;
}

export async function borrarProveedor(id) {
  const [result] = await pool.query("DELETE FROM proveedores WHERE id = ?", [
    id,
  ]);
  return result;
}

export async function emailProveedorExiste(email) {
  const [rows] = await pool.query(
    "SELECT id FROM proveedores WHERE email = ?",
    [email]
  );
  return rows.length > 0;
}

export async function emailProveedorDuplicado(email, idActual) {
  const [rows] = await pool.query(
    "SELECT id FROM proveedores WHERE email = ? AND id != ?",
    [email, idActual]
  );
  return rows.length > 0;
}
