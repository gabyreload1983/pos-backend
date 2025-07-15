import { pool } from "../config/db.js";
import { ACCIONES_LOG } from "../constants/index.js";
import {
  obtenerTotalSistema,
  registrarArqueo,
  obtenerArqueosDeCaja,
} from "../models/arqueo.model.js";
import { obtenerCajaAbierta } from "../models/cajas.model.js";
import { registrarLog } from "../utils/logger.js";

export async function realizarArqueo(
  { total_contado, observaciones },
  usuario_id
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const caja = await obtenerCajaAbierta(usuario_id);
    if (!caja) throw new Error("No hay caja abierta");

    const total_sistema = await obtenerTotalSistema(caja.id);
    const diferencia = total_contado - total_sistema;

    const id = await registrarArqueo(connection, {
      caja_id: caja.id,
      usuario_id,
      total_sistema,
      total_contado,
      diferencia,
      observaciones,
    });

    await registrarLog({
      usuario_id,
      tabla: "arqueos_caja",
      accion_id: ACCIONES_LOG.INSERT,
      descripcion: `Arqueo de caja ID ${id}`,
      registro_id: id,
      datos_nuevos: { total_sistema, total_contado, diferencia, observaciones },
    });

    await connection.commit();
    connection.release();
    return id;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

export async function listarArqueos(usuario_id) {
  const caja = await obtenerCajaAbierta(usuario_id);
  if (!caja) throw new Error("No hay caja abierta");
  return await obtenerArqueosDeCaja(caja.id);
}
