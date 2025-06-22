import { pool } from "../config/db.js";

export async function crearPago(connection, data) {
  const [result] = await connection.query(
    "INSERT INTO pagos (cliente_id, usuario_id, fecha, monto, metodo_pago, observaciones) VALUES (?, ?, ?, ?, ?, ?)",
    [
      data.cliente_id,
      data.usuario_id,
      data.fecha,
      data.monto,
      data.metodo_pago,
      data.observaciones || null,
    ]
  );
  return result.insertId;
}
