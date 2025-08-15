import { pool } from "../config/db.js";
import { ESTADOS_REMITO } from "../constants/index.js";

export async function crearCompra({
  connection,
  data,
  usuario_id,
  total_neto,
  total_iva,
}) {
  const [result] = await connection.query(
    `INSERT INTO compras (
      proveedor_id, usuario_id, sucursal_id,
      tipo_comprobante_id, punto_venta, numero_comprobante,
      total_neto, total_iva, observaciones, mueve_stock, estado_remito_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.proveedor_id,
      usuario_id,
      data.sucursal_id,
      data.tipo_comprobante_id,
      data.punto_venta,
      data.numero_comprobante,
      total_neto,
      total_iva,
      data.observaciones || null,
      data.mueve_stock ? 1 : 0,
      data.mueve_stock ? ESTADOS_REMITO.COMPLETO : ESTADOS_REMITO.SIN_REMITIR,
    ]
  );
  return result.insertId;
}

export async function crearCompraDesdeRemitos({
  connection,
  data,
  usuario_id,
  total_neto,
  total_iva,
}) {
  const [result] = await connection.query(
    `INSERT INTO compras (
      proveedor_id, usuario_id, sucursal_id,
      tipo_comprobante_id, punto_venta, numero_comprobante,
      total_neto, total_iva, observaciones, mueve_stock, estado_remito_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.proveedor_id,
      usuario_id,
      data.sucursal_id,
      data.tipo_comprobante_id,
      data.punto_venta,
      data.numero_comprobante,
      total_neto,
      total_iva,
      data.observaciones || null,
      0,
      ESTADOS_REMITO.COMPLETO,
    ]
  );
  return result.insertId;
}

export async function insertarDetalleCompra({
  connection,
  compra_id,
  itemsCompra,
}) {
  for (const item of itemsCompra) {
    await connection.query(
      `INSERT INTO detalle_compra (
        compra_id, articulo_id, cantidad,
        costo_unitario_ars, porcentaje_iva, monto_iva, moneda_id, tasa_cambio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        compra_id,
        item.articulo_id,
        item.cantidad,
        item.costo_unitario_ars,
        item.porcentaje_iva,
        item.monto_iva,
        item.moneda_id,
        item.tasa_cambio || null,
      ]
    );
  }
}

export async function insertarDetalleCompraSeries(
  connection,
  detalle_compra_id,
  series
) {
  const values = series.map((serie) => [detalle_compra_id, serie]);
  await connection.query(
    "INSERT INTO detalle_compra_series (detalle_compra_id, nro_serie) VALUES ?",
    [values]
  );
}

export async function obtenerCompras() {
  const [rows] = await pool.query(`
    SELECT c.id, c.fecha, tc.nombre AS tipo_comprobante, c.numero_comprobante, c.total,
           u.nombre AS usuario, p.nombre AS proveedor
    FROM compras c
    JOIN tipos_comprobante tc ON c.tipo_comprobante_id = tc.id
    JOIN usuarios u ON c.usuario_id = u.id
    JOIN proveedores p ON c.proveedor_id = p.id
    ORDER BY c.fecha DESC, c.id DESC
  `);
  return rows;
}

export async function obtenerCompraPorId(id) {
  const [cabecera] = await pool.query(
    `SELECT c.*, tc.nombre AS tipo_comprobante, u.nombre AS usuario, p.nombre AS proveedor
     FROM compras c
     JOIN tipos_comprobante tc ON c.tipo_comprobante_id = tc.id
     JOIN usuarios u ON c.usuario_id = u.id
     JOIN proveedores p ON c.proveedor_id = p.id
     WHERE c.id = ?`,
    [id]
  );

  const [detalle] = await pool.query(
    `SELECT d.*, a.nombre AS articulo
     FROM detalle_compra d
     JOIN articulos a ON d.articulo_id = a.id
     WHERE d.compra_id = ?`,
    [id]
  );

  return {
    ...cabecera[0],
    items: detalle,
  };
}

export async function insertarComprasIvaResumen({
  connection,
  compra_id,
  resumen,
}) {
  if (!resumen?.length) return;

  const sql = `
    INSERT INTO compras_iva_resumen (compra_id, iva_aliquota_id, neto, iva)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE neto = VALUES(neto), iva = VALUES(iva)
  `;

  for (const r of resumen) {
    await connection.query(sql, [compra_id, r.iva_aliquota_id, r.neto, r.iva]);
  }
}

export async function asociarRemitosACompra({
  connection,
  compra_id,
  remitos_id,
}) {
  if (!remitos_id?.length) return;
  const values = remitos_id.map((r) => [r, compra_id]);
  await connection.query(
    `INSERT INTO remito_factura_compra (remito_id, compra_id) VALUES ?`,
    [values]
  );
}

export async function obtenerCantidadesRemitadasPorArticulo({
  connection,
  remitos_id,
}) {
  const [rows] = await connection.query(
    `SELECT articulo_id, SUM(cantidad) AS cantidad
     FROM detalle_remito_compra
     WHERE remito_id IN (?)
     GROUP BY articulo_id`,
    [remitos_id]
  );
  return rows;
}
