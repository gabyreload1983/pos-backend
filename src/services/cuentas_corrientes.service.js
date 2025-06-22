import { pool } from "../config/db.js";
import {
  obtenerMovimientosPorCliente,
  obtenerUltimoSaldo,
  registrarMovimientoConSaldo,
} from "../models/cuentas_corrientes.model.js";
import { registrarLog } from "../utils/logger.js";

export async function listarMovimientos(cliente_id) {
  return await obtenerMovimientosPorCliente(cliente_id);
}

export async function nuevoMovimiento(data, usuario_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT saldo FROM cuentas_corrientes WHERE cliente_id = ? ORDER BY fecha DESC, id DESC LIMIT 1",
      [data.cliente_id]
    );

    const saldoAnterior = rows[0]?.saldo || 0;
    const nuevoSaldo =
      data.tipo === "debe"
        ? saldoAnterior + data.monto
        : saldoAnterior - data.monto;

    const id = await registrarMovimientoConSaldo(connection, {
      ...data,
      saldo: nuevoSaldo,
    });

    await registrarLog({
      usuario_id,
      tabla: "cuentas_corrientes",
      accion: "INSERT",
      descripcion: `Movimiento CC ${data.tipo} por ${data.monto}`,
      registro_id: id,
      datos_nuevos: data,
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
