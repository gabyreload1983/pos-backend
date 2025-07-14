import { pool } from "../config/db.js";

export async function registrarMovimientoStock({
  articulo_id,
  sucursal_id,
  cantidad,
  tipo,
  origen,
  origen_id,
  observaciones,
}) {
  await pool.query(
    `INSERT INTO movimientos_stock (articulo_id, sucursal_id, cantidad, tipo, origen, origen_id, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      articulo_id,
      sucursal_id,
      cantidad,
      tipo,
      origen,
      origen_id,
      observaciones || null,
    ]
  );
}
