import { pool } from "../config/db.js";

export async function obtenerClientes() {
  const [rows] = await pool.query(`
    SELECT c.*, ci.nombre AS ciudad, p.nombre AS provincia
    FROM clientes c
    LEFT JOIN ciudades ci ON c.ciudad_id = ci.id
    LEFT JOIN provincias p ON c.provincia_id = p.id
    WHERE c.activo = 1
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
  const {
    nombre,
    apellido,
    razon_social,
    tipo_documento,
    numero_documento,
    email,
    telefono,
    direccion,
    ciudad_id,
    provincia_id,
    pais,
    condicion_iva,
    cuit,
  } = data;

  // Validar que provincia exista
  const [provincia] = await pool.query(
    "SELECT id FROM provincias WHERE id = ?",
    [provincia_id]
  );
  if (provincia.length === 0) {
    throw new Error("Provincia inválida");
  }

  // Validar que ciudad exista
  const [ciudad] = await pool.query("SELECT id FROM ciudades WHERE id = ?", [
    ciudad_id,
  ]);
  if (ciudad.length === 0) {
    throw new Error("Ciudad inválida");
  }

  // Insertar cliente
  const [result] = await pool.query(
    `
    INSERT INTO clientes (
      nombre, apellido, razon_social, tipo_documento, numero_documento,
      email, telefono, direccion, ciudad_id, provincia_id,
      pais, condicion_iva, cuit
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      apellido,
      razon_social,
      tipo_documento,
      numero_documento,
      email,
      telefono,
      direccion,
      ciudad_id,
      provincia_id,
      pais,
      condicion_iva,
      cuit,
    ]
  );

  return result.insertId;
}

export async function actualizarCliente(id, data) {
  const { provincia_id, ciudad_id } = data;

  // Validar provincia
  const [provincia] = await pool.query(
    "SELECT id FROM provincias WHERE id = ?",
    [provincia_id]
  );
  console.log("Provincia:", provincia);

  if (provincia.length === 0) {
    throw new Error("Provincia inválida");
  }

  // Validar ciudad
  const [ciudad] = await pool.query("SELECT id FROM ciudades WHERE id = ?", [
    ciudad_id,
  ]);
  console.log("Ciudad:", ciudad);

  if (ciudad.length === 0) {
    throw new Error("Ciudad inválida");
  }

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
