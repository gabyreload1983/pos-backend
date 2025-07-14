export async function registrarMovimientoCaja({
  caja_id,
  tipo_movimiento,
  motivo,
  descripcion,
  monto,
}) {
  await pool.query(
    `INSERT INTO movimientos_caja (caja_id, tipo_movimiento, motivo, descripcion, monto)
     VALUES (?, ?, ?, ?, ?)`,
    [caja_id, tipo_movimiento, motivo, descripcion, monto]
  );
}
