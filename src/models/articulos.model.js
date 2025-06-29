import { pool } from "../config/db.js";

export async function obtenerArticulos() {
  const [rows] = await pool.query("SELECT * FROM articulos");
  return rows;
}

export async function obtenerArticuloPorId(id) {
  const [rows] = await pool.query("SELECT * FROM articulos WHERE id = ?", [id]);
  return rows[0];
}

export async function crearArticulo(data) {
  const [result] = await pool.query(
    `INSERT INTO articulos 
    (nombre, descripcion, costo, iva_id, moneda_id, renta, precio_venta, categoria_id, marca_id, proveedor_id, codigo_barra, unidad_medida, controla_stock, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre,
      data.descripcion || null,
      data.costo,
      data.iva_id,
      data.moneda_id,
      data.renta,
      data.precio_venta,
      data.categoria_id || null,
      data.marca_id || null,
      data.proveedor_id || null,
      data.codigo_barra || null,
      data.unidad_medida || null,
      data.controla_stock ?? 1,
      data.activo ?? 1,
    ]
  );
  return result.insertId;
}

export async function actualizarArticulo(id, data) {
  const [result] = await pool.query(
    `UPDATE articulos SET 
      nombre = ?, descripcion = ?, costo = ?, iva_id = ?, moneda_id = ?, renta = ?, precio_venta = ?, 
      categoria_id = ?, marca_id = ?, proveedor_id = ?, codigo_barra = ?, unidad_medida = ?, 
      controla_stock = ?, activo = ?
    WHERE id = ?`,
    [
      data.nombre,
      data.descripcion || null,
      data.costo,
      data.iva_id,
      data.moneda_id,
      data.renta,
      data.precio_venta,
      data.categoria_id || null,
      data.marca_id || null,
      data.proveedor_id || null,
      data.codigo_barra || null,
      data.unidad_medida || null,
      data.controla_stock ?? 1,
      data.activo ?? 1,
      id,
    ]
  );
  return result.affectedRows;
}

export async function eliminarArticulo(id) {
  const [result] = await pool.query(
    "UPDATE articulos SET activo = 0 WHERE id = ?",
    [id]
  );
  return result.affectedRows;
}
