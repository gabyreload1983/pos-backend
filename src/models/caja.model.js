
import { pool } from '../config/db.js';

export async function abrirCaja(connection, data) {
  const [result] = await connection.query(
    'INSERT INTO caja (usuario_id, fecha_apertura, saldo_inicial) VALUES (?, ?, ?)',
    [data.usuario_id, data.fecha_apertura, data.saldo_inicial]
  );
  return result.insertId;
}

export async function cerrarCaja(connection, caja_id, data) {
  await connection.query(
    'UPDATE caja SET fecha_cierre = ?, saldo_final = ? WHERE id = ?',
    [data.fecha_cierre, data.saldo_final, caja_id]
  );
}

export async function registrarMovimientoCaja(connection, data) {
  const [result] = await connection.query(
    'INSERT INTO movimientos_caja (caja_id, tipo, concepto, monto, usuario_id) VALUES (?, ?, ?, ?, ?)',
    [data.caja_id, data.tipo, data.concepto, data.monto, data.usuario_id]
  );
  return result.insertId;
}

export async function obtenerCajaAbierta(usuario_id) {
  const [rows] = await pool.query(
    'SELECT * FROM caja WHERE usuario_id = ? AND fecha_cierre IS NULL ORDER BY fecha_apertura DESC LIMIT 1',
    [usuario_id]
  );
  return rows[0];
}

export async function obtenerMovimientos(caja_id) {
  const [rows] = await pool.query(
    'SELECT * FROM movimientos_caja WHERE caja_id = ? ORDER BY id ASC',
    [caja_id]
  );
  return rows;
}
