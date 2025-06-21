import { pool } from "../config/db.js";

/**
 * Registra una acción en la tabla logs
 * @param {Object} data
 * @param {number} data.usuario_id
 * @param {string} data.tabla - Ej: 'usuarios', 'ventas'
 * @param {string} data.accion - Ej: 'LOGIN', 'INSERT', 'UPDATE'
 * @param {number|null} data.registro_id - ID del registro afectado
 * @param {string} data.descripcion - Mensaje legible
 * @param {any} [data.datos_anteriores] - JSON stringificado
 * @param {any} [data.datos_nuevos] - JSON stringificado
 */
export async function registrarLog({
  usuario_id,
  tabla,
  accion,
  registro_id = null,
  descripcion,
  datos_anteriores = null,
  datos_nuevos = null,
}) {
  await pool.query(
    `INSERT INTO logs (usuario_id, tabla, accion, registro_id, descripcion, datos_anteriores, datos_nuevos)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      usuario_id,
      tabla,
      accion,
      registro_id,
      descripcion,
      datos_anteriores ? JSON.stringify(datos_anteriores) : null,
      datos_nuevos ? JSON.stringify(datos_nuevos) : null,
    ]
  );
}
