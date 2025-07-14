import { pool } from "../config/db.js";

export async function obtenerSucursalesDelUsuario(usuario_id) {
  const [rows] = await pool.query(
    `SELECT s.id, s.nombre
     FROM usuarios_sucursales us
     JOIN sucursales s ON us.sucursal_id = s.id
     WHERE us.usuario_id = ?`,
    [usuario_id]
  );
  return rows;
}

export async function usuarioTieneAccesoASucursal(usuario_id, sucursal_id) {
  const [rows] = await pool.query(
    `SELECT 1 FROM usuarios_sucursales 
     WHERE usuario_id = ? AND sucursal_id = ? LIMIT 1`,
    [usuario_id, sucursal_id]
  );
  return rows.length > 0;
}
