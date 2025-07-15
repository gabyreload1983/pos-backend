import { pool } from "../config/db.js";

export async function registrarMovimientoCaja({
  caja_id,
  tipo_movimiento,
  motivo_id,
  descripcion,
  monto,
}) {
  await pool.query(
    `INSERT INTO movimientos_caja (caja_id, tipo_movimiento, motivo_id, descripcion, monto)
     VALUES (?, ?, ?, ?, ?)`,
    [caja_id, tipo_movimiento, motivo_id, descripcion, monto]
  );
}
