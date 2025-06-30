import { pool } from "../config/db.js";

export async function obtenerClientes() {
  const [rows] = await pool.query(`
    SELECT c.*, ci.nombre AS ciudad, p.nombre AS provincia
    FROM clientes c
    LEFT JOIN ciudades ci ON c.ciudad_id = ci.id
    LEFT JOIN provincias p ON p.id = c.provincia_id
    ORDER BY c.nombre
  `);
  return rows;
}

export async function obtenerClientePorId(id) {
  const [rows] = await pool.query(
    `SELECT * FROM clientes WHERE id = ? AND activo = 1`,
    [id]
  );
  return rows[0];
}

export async function crearCliente(data) {
  const [result] = await pool.query(
    `INSERT INTO clientes (
      nombre, apellido, razon_social, tipo_documento, numero_documento,
      email, telefono, direccion, ciudad_id, provincia_id,
      condicion_iva_id, cuit
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre,
      data.apellido,
      data.razon_social,
      data.tipo_documento,
      data.numero_documento,
      data.email,
      data.telefono,
      data.direccion,
      data.ciudad_id,
      data.provincia_id,
      data.condicion_iva_id,
      data.cuit,
    ]
  );
  return result.insertId;
}

export async function actualizarCliente(id, data) {
  const [result] = await pool.query(`UPDATE clientes SET ? WHERE id = ?`, [
    data,
    id,
  ]);
  return result.affectedRows;
}

export async function eliminarCliente(id) {
  const [result] = await pool.query(
    `UPDATE clientes SET activo = 0 WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
}

export async function emailClienteExiste(email) {
  const [rows] = await pool.query("SELECT id FROM clientes WHERE email = ?", [
    email,
  ]);
  return rows.length > 0;
}

export async function emailClienteDuplicado(email, idActual) {
  const [rows] = await pool.query(
    "SELECT id FROM clientes WHERE email = ? AND id != ?",
    [email, idActual]
  );
  return rows.length > 0;
}
