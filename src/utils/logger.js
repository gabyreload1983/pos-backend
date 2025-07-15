import { pool } from "../config/db.js";

export async function registrarLog({
  usuario_id,
  tabla,
  accion_id,
  registro_id = null,
  descripcion,
  datos_anteriores = null,
  datos_nuevos = null,
}) {
  await pool.query(
    `INSERT INTO logs (usuario_id, tabla, accion_id, registro_id, descripcion, datos_anteriores, datos_nuevos)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      usuario_id,
      tabla,
      accion_id,
      registro_id,
      descripcion,
      datos_anteriores ? JSON.stringify(datos_anteriores) : null,
      datos_nuevos ? JSON.stringify(datos_nuevos) : null,
    ]
  );
}
