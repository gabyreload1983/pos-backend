import { pool } from "../config/db.js";

export async function obtenerArticulos() {
  const [rows] = await pool.query(`
    SELECT a.*, c.nombre AS categoria, m.nombre AS marca, i.descripcion AS iva, mo.nombre AS moneda
    FROM articulos a
    LEFT JOIN categorias c ON a.categoria_id = c.id
    LEFT JOIN marcas m ON a.marca_id = m.id
    LEFT JOIN iva i ON a.iva_id = i.id
    LEFT JOIN monedas mo ON a.moneda_id = mo.id
    WHERE a.activo = 1
    ORDER BY a.nombre
  `);
  return rows;
}

export async function obtenerArticuloPorId(id) {
  const [rows] = await pool.query(
    `SELECT * FROM articulos WHERE id = ? AND activo = 1`,
    [id]
  );
  return rows[0];
}

export async function crearArticulo(data) {
  const [result] = await pool.query(
    `
    INSERT INTO articulos (
      nombre, descripcion, costo, iva_id, moneda_id, renta, precio_venta,
      categoria_id, marca_id, proveedor_id, codigo_barra, unidad_medida
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre,
      data.descripcion,
      data.costo,
      data.iva_id,
      data.moneda_id,
      data.renta,
      data.precio_venta,
      data.categoria_id,
      data.marca_id,
      data.proveedor_id,
      data.codigo_barra,
      data.unidad_medida,
    ]
  );
  return result.insertId;
}

export async function actualizarArticulo(id, data) {
  const [result] = await pool.query(`UPDATE articulos SET ? WHERE id = ?`, [
    data,
    id,
  ]);
  return result.affectedRows;
}

export async function eliminarArticulo(id) {
  const [result] = await pool.query(
    `UPDATE articulos SET activo = 0 WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
}
