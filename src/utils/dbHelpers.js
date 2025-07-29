import { pool } from "../config/db.js";
import { ESTADOS_NUMEROS_SERIE } from "../constants/estados_numeros_serie.js";

export async function existeEnTabla(tabla, id) {
  const [rows] = await pool.query(`SELECT id FROM ${tabla} WHERE id = ?`, [id]);
  return rows.length > 0;
}

export async function existeComprobanteProveedor(
  proveedor_id,
  punto_venta,
  numero_comprobante
) {
  const [rows] = await pool.query(
    `SELECT id FROM compras
     WHERE proveedor_id = ? AND punto_venta = ? AND numero_comprobante = ?`,
    [proveedor_id, punto_venta, numero_comprobante]
  );
  return rows.length > 0;
}

export async function existenSeriesDuplicadas(series = []) {
  if (!series.length) return false;

  const [rows] = await pool.query(
    `
    SELECT nro_serie FROM (
      SELECT nro_serie FROM detalle_compra_series
      UNION
      SELECT nro_serie FROM detalle_remito_series
    ) AS all_series
    WHERE nro_serie IN (?)
    `,
    [series]
  );

  return rows.length > 0 ? rows.map((r) => r.nro_serie) : false;
}

export async function insertarNumerosSerie(
  connection,
  articulo_id,
  series,
  sucursal_id
) {
  if (!series?.length) return;
  await connection.query(
    `INSERT INTO numeros_serie (articulo_id, nro_serie, sucursal_id, estado_id)
     VALUES ?`,
    [
      series.map((nro) => [
        articulo_id,
        nro,
        sucursal_id,
        ESTADOS_NUMEROS_SERIE.DISPONIBLE,
      ]),
    ]
  );
}

export async function obtenerEstadoSerie(articulo_id, sucursal_id, nro_serie) {
  const [rows] = await pool.query(
    `
    SELECT 
    ns.nro_serie,
    ens.id AS estado_id,
    ens.nombre AS estado
    FROM numeros_serie ns
    LEFT JOIN estados_numeros_serie ens
    ON ns.estado_id = ens.id
    WHERE articulo_id = ? AND sucursal_id = ? AND nro_serie = ?
    `,
    [articulo_id, sucursal_id, nro_serie]
  );

  return rows[0] || null;
}

export async function venderNumeroSerie(articulo_id, serie, sucursal_id) {
  const [result] = await pool.query(
    `UPDATE numeros_serie SET estado_id = ${ESTADOS_NUMEROS_SERIE.VENDIDO} 
      WHERE articulo_id = ? AND sucursal_id = ? AND nro_serie = ?
      `,
    [articulo_id, sucursal_id, serie]
  );
  return result.affectedRows;
}
