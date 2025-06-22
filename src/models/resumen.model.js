import { pool } from "../config/db.js";

export async function obtenerTotalesCaja(caja_id) {
  const [movs] = await pool.query(
    `SELECT tipo, metodo_pago, SUM(monto) AS total
     FROM movimientos_caja
     WHERE caja_id = ?
     GROUP BY tipo, metodo_pago`,
    [caja_id]
  );
  return movs;
}

export async function obtenerTotalesVentas(caja_id) {
  const [ventas] = await pool.query(
    `SELECT tipo_pago, SUM(total) AS total
     FROM ventas
     WHERE caja_id = ?
     GROUP BY tipo_pago`,
    [caja_id]
  );
  return ventas;
}

export async function obtenerTotalesPagos(caja_id) {
  const [pagos] = await pool.query(
    `SELECT metodo_pago, SUM(monto) AS total
     FROM pagos
     WHERE caja_id = ?
     GROUP BY metodo_pago`,
    [caja_id]
  );
  return pagos;
}
