import { pool } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

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
  const { provincia_id, ciudad_id, email } = data;

  if (provincia_id !== null && provincia_id !== undefined) {
    const [provincia] = await pool.query(
      "SELECT id FROM provincias WHERE id = ?",
      [provincia_id]
    );
    if (provincia.length === 0) {
      throw ApiError.validation([
        { campo: "provincia_id", mensaje: "Provincia inexistente" },
      ]);
    }
  }

  // Validar que ciudad exista si viene
  if (ciudad_id !== null && ciudad_id !== undefined) {
    const [ciudad] = await pool.query("SELECT id FROM ciudades WHERE id = ?", [
      ciudad_id,
    ]);
    if (ciudad.length === 0) {
      throw ApiError.validation([
        { campo: "ciudad_id", mensaje: "Ciudad inexistente" },
      ]);
    }
  }

  if (email) {
    const [existe] = await pool.query(
      "SELECT id FROM proveedores WHERE email = ?",
      [email]
    );
    if (existe.length > 0) {
      throw ApiError.validation([
        { campo: "email", mensaje: "Ya existe un proveedor con ese email" },
      ]);
    }
  }

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
  const { provincia_id, ciudad_id, email } = data;

  if (provincia_id !== null && provincia_id !== undefined) {
    const [provincia] = await pool.query(
      "SELECT id FROM provincias WHERE id = ?",
      [provincia_id]
    );
    if (provincia.length === 0) {
      throw ApiError.validation([
        { campo: "provincia_id", mensaje: "Provincia inexistente" },
      ]);
    }
  }

  if (ciudad_id !== null && ciudad_id !== undefined) {
    const [ciudad] = await pool.query("SELECT id FROM ciudades WHERE id = ?", [
      ciudad_id,
    ]);
    if (ciudad.length === 0) {
      throw ApiError.validation([
        { campo: "ciudad_id", mensaje: "Ciudad inexistente" },
      ]);
    }
  }

  if (email) {
    const [duplicado] = await pool.query(
      "SELECT id FROM proveedores WHERE email = ? AND id != ?",
      [email, id]
    );
    if (duplicado.length > 0) {
      throw ApiError.validation([
        {
          campo: "email",
          mensaje: "El email ya está siendo usado por otro proveedor",
        },
      ]);
    }
  }

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
