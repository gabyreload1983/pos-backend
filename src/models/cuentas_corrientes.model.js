
import { pool } from '../config/db.js';

export async function obtenerMovimientosPorCliente(cliente_id) {
  const [rows] = await pool.query(
    'SELECT * FROM cuentas_corrientes WHERE cliente_id = ? ORDER BY fecha ASC, id ASC',
    [cliente_id]
  );
  return rows;
}

export async function obtenerUltimoSaldo(cliente_id) {
  const [rows] = await pool.query(
    'SELECT saldo FROM cuentas_corrientes WHERE cliente_id = ? ORDER BY fecha DESC, id DESC LIMIT 1',
    [cliente_id]
  );
  return rows[0]?.saldo || 0;
}

export async function registrarMovimientoConSaldo(connection, data) {
  const [result] = await connection.query(
    'INSERT INTO cuentas_corrientes (cliente_id, fecha, tipo, concepto, monto, saldo) VALUES (?, ?, ?, ?, ?, ?)',
    [
      data.cliente_id,
      data.fecha,
      data.tipo,
      data.concepto,
      data.monto,
      data.saldo
    ]
  );
  return result.insertId;
}
