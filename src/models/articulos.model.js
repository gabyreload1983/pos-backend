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
    (nombre, slug, descripcion, descripcion_larga, costo, renta, precio_venta, 
    iva_aliquota_id, moneda_id, categoria_id, marca_id, proveedor_id, 
    codigo_barra, unidad_medida, controla_stock, tiene_nro_serie, activo, 
    publicado_web, seo_title, seo_description, external_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre,
      data.slug || null,
      data.descripcion || null,
      data.descripcion_larga || null,
      data.costo,
      data.renta,
      data.precio_venta,
      data.iva_aliquota_id,
      data.moneda_id,
      data.categoria_id || null,
      data.marca_id || null,
      data.proveedor_id || null,
      data.codigo_barra || null,
      data.unidad_medida || null,
      data.controla_stock ?? 1,
      data.tiene_nro_serie ?? 0,
      1,
      data.publicado_web ?? 0,
      data.seo_title || null,
      data.seo_description || null,
      data.external_id || null,
    ]
  );
  return result.insertId;
}

export async function actualizarArticulo(id, data) {
  const [result] = await pool.query(
    `UPDATE articulos SET 
      nombre = ?, slug = ?, descripcion = ?, descripcion_larga = ?, costo = ?, 
      renta = ?, precio_venta = ?, iva_aliquota_id = ?, moneda_id = ?, categoria_id = ?, 
      marca_id = ?, proveedor_id = ?, codigo_barra = ?, unidad_medida = ?, 
      controla_stock = ?, tiene_nro_serie = ?, activo = ?, publicado_web = ?, 
      seo_title = ?, seo_description = ?, external_id = ?
      WHERE id = ?`,
    [
      data.nombre,
      data.slug || null,
      data.descripcion || null,
      data.descripcion_larga || null,
      data.costo,
      data.renta,
      data.precio_venta,
      data.iva_aliquota_id,
      data.moneda_id,
      data.categoria_id || null,
      data.marca_id || null,
      data.proveedor_id || null,
      data.codigo_barra || null,
      data.unidad_medida || null,
      data.controla_stock ?? 1,
      data.tiene_nro_serie ?? 0,
      data.activo ?? 1,
      data.publicado_web ?? 0,
      data.seo_title || null,
      data.seo_description || null,
      data.external_id || null,
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

export async function obtenerArticulosPublicados() {
  const [rows] = await pool.query(
    `SELECT 
      a.id, a.nombre, a.slug, a.descripcion_larga, a.precio_venta, 
      a.seo_title, a.seo_description, a.external_id, a.moneda_id,
      m.simbolo AS moneda_simbolo,
      ia.url_imagen
    FROM articulos a
    LEFT JOIN monedas m ON a.moneda_id = m.id
    LEFT JOIN (
      SELECT articulo_id, MIN(url_imagen) AS url_imagen
      FROM articulo_imagenes
      WHERE activo = 1
      GROUP BY articulo_id
    ) ia ON ia.articulo_id = a.id
    WHERE a.publicado_web = 1 AND a.activo = 1`
  );
  return rows;
}

export async function obtenerArticuloPorSlug(slug) {
  const [rows] = await pool.query(
    `SELECT 
      a.id, a.nombre, a.slug, a.descripcion_larga, a.precio_venta, 
      a.seo_title, a.seo_description, a.external_id, a.moneda_id,
      m.simbolo AS moneda_simbolo
    FROM articulos a
    LEFT JOIN monedas m ON a.moneda_id = m.id
    WHERE a.slug = ? AND a.publicado_web = 1 AND a.activo = 1
    LIMIT 1`,
    [slug]
  );
  return rows[0];
}

export async function tieneNroSerie(articulo_id) {
  const [result] = await pool.query(
    "SELECT tiene_nro_serie FROM articulos WHERE id = ?",
    [articulo_id]
  );
  return result[0]?.tiene_nro_serie === 1;
}
