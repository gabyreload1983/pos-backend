import { pool } from "../config/db.js";

export async function registrarMovimientoStock({
  articulo_id,
  sucursal_id,
  cantidad,
  tipo,
  origen_id,
  origen_id_externo,
  observaciones,
}) {
  await pool.query(
    `INSERT INTO movimientos_stock (articulo_id, sucursal_id, cantidad, tipo, origen_id, origen_id_externo, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      articulo_id,
      sucursal_id,
      cantidad,
      tipo,
      origen_id,
      origen_id_externo,
      observaciones || null,
    ]
  );
}
