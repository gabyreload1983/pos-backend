
import { pool } from '../config/db.js';

export async function obtenerTotalSistema(caja_id) {
  const [ingresos] = await pool.query(
    "SELECT SUM(monto) AS total FROM movimientos_caja WHERE caja_id = ? AND tipo = 'ingreso'", [caja_id]
  );
  const [egresos] = await pool.query(
    "SELECT SUM(monto) AS total FROM movimientos_caja WHERE caja_id = ? AND tipo = 'egreso'", [caja_id]
  );

  const total = (ingresos[0].total || 0) - (egresos[0].total || 0);
  return total;
}

export async function registrarArqueo(connection, data) {
  const [result] = await connection.query(
    'INSERT INTO arqueos_caja (caja_id, usuario_id, total_sistema, total_contado, diferencia, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
    [data.caja_id, data.usuario_id, data.total_sistema, data.total_contado, data.diferencia, data.observaciones || null]
  );
  return result.insertId;
}

export async function obtenerArqueosDeCaja(caja_id) {
  const [rows] = await pool.query(
    'SELECT * FROM arqueos_caja WHERE caja_id = ? ORDER BY fecha DESC',
    [caja_id]
  );
  return rows;
}
