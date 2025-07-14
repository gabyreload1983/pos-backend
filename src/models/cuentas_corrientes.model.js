import { pool } from "../config/db.js";

export async function registrarMovimientoConSaldo(connection, data) {
  const [result] = await connection.query(
    "INSERT INTO cuentas_corrientes (cliente_id, fecha, tipo, concepto, monto, saldo) VALUES (?, ?, ?, ?, ?, ?)",
    [
      data.cliente_id,
      data.fecha,
      data.tipo,
      data.concepto,
      data.monto,
      data.saldo,
    ]
  );
  return result.insertId;
}

export async function obtenerMovimientosPorCliente(
  cliente_id,
  desde = null,
  hasta = null
) {
  let query = "SELECT * FROM cuentas_corrientes WHERE cliente_id = ?";
  const params = [cliente_id];

  if (desde) {
    query += " AND fecha >= ?";
    params.push(desde);
  }

  if (hasta) {
    query += " AND fecha <= ?";
    params.push(hasta);
  }

  query += " ORDER BY fecha ASC, id ASC";
  const [rows] = await pool.query(query, params);
  return rows;
}

export async function obtenerSaldoParcial(cliente_id, hasta) {
  const [rows] = await pool.query(
    `SELECT saldo FROM cuentas_corrientes
     WHERE cliente_id = ? AND fecha <= ?
     ORDER BY fecha DESC, id DESC LIMIT 1`,
    [cliente_id, hasta]
  );
  return rows[0]?.saldo || 0;
}

export async function registrarMovimientoCuentaCorriente({
  cliente_id,
  venta_id,
  tipo_movimiento,
  descripcion,
  monto,
}) {
  await pool.query(
    `INSERT INTO cuentas_corrientes (cliente_id, venta_id, tipo_movimiento, descripcion, monto)
     VALUES (?, ?, ?, ?, ?)`,
    [cliente_id, venta_id, tipo_movimiento, descripcion, monto]
  );
}
