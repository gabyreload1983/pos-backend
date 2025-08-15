// src/models/remitos_compra.model.js
import { pool } from "../config/db.js";

// 1. Crear cabecera del remito
export async function crearRemitoCompra(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO remitos_compra (
      proveedor_id, usuario_id, sucursal_id, fecha, observaciones, total
    ) VALUES (?, ?, ?, NOW(), ?, ?)`,
    [
      data.proveedor_id || null,
      data.usuario_id,
      data.sucursal_id,
      data.observaciones || null,
      data.total || 0,
    ]
  );
  return result.insertId;
}

// 2. Insertar ítems del remito
export async function insertarDetalleRemitoCompra(
  connection,
  remito_id,
  items
) {
  const inserted = [];

  for (const item of items) {
    const [result] = await connection.query(
      `INSERT INTO detalle_remito_compra (
        remito_id, articulo_id, cantidad, detalle_compra_id
      ) VALUES (?, ?, ?, ?)`,
      [remito_id, item.articulo_id, item.cantidad, item.detalle_compra_id]
    );

    inserted.push({ detalle_remito_id: result.insertId, ...item });
  }

  return inserted;
}

// 3. Insertar series (si corresponde)
export async function insertarRemitoSeries(
  connection,
  detalle_remito_id,
  series
) {
  const values = series.map((serie) => [detalle_remito_id, serie]);
  await connection.query(
    `INSERT INTO detalle_remito_series (detalle_remito_id, nro_serie) VALUES ?`,
    [values]
  );
}

// 4. Marcar relación con la compra
export async function vincularRemitoConCompra(
  connection,
  compra_id,
  remito_id
) {
  await connection.query(
    `INSERT INTO remito_factura_compra (compra_id, remito_id) VALUES (?, ?)`,
    [compra_id, remito_id]
  );
}

// 5. Obtener lo pendiente por remitir de una compra
export async function obtenerPendientesCompra(compra_id, connection = pool) {
  const [result] = await connection.query(
    `
    SELECT dc.id AS detalle_compra_id, dc.articulo_id, dc.cantidad,
      COALESCE(SUM(drc.cantidad), 0) AS cantidad_remitada
    FROM detalle_compra dc
    LEFT JOIN detalle_remito_compra drc ON drc.detalle_compra_id = dc.id
    WHERE dc.compra_id = ?
    GROUP BY dc.id, dc.articulo_id, dc.cantidad
  `,
    [compra_id]
  );

  return result;
}

// 6. Actualizar estado_remito según si está completo
export async function actualizarEstadoRemitoCompra(
  connection,
  compra_id,
  estado_remito_id
) {
  await connection.query(
    `UPDATE compras SET estado_remito_id = ? WHERE id = ?`,
    [estado_remito_id, compra_id]
  );
}

export async function validarRemitosCompra({ connection, remitosId }) {
  const [remitos] = await connection.query(
    `SELECT id FROM remitos_compra WHERE id IN (?)`,
    [remitosId]
  );

  return remitos || null;
}
