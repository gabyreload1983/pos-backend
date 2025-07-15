import { pool } from "../config/db.js";
import { ACCIONES_LOG } from "../constants/index.js";
import {
  abrirCaja,
  cerrarCaja,
  registrarMovimientoCaja,
  obtenerCajaAbierta,
  obtenerMovimientos,
} from "../models/cajas.model.js";
import { registrarLog } from "../utils/logger.js";

export async function aperturaCaja(
  { fecha_apertura, saldo_inicial },
  usuario_id
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const id = await abrirCaja(connection, {
      usuario_id,
      fecha_apertura,
      saldo_inicial,
    });

    await registrarLog({
      usuario_id,
      tabla: "cajas",
      accion_id: ACCIONES_LOG.INSERT,
      descripcion: `Apertura de caja ID ${id}`,
      registro_id: id,
      datos_nuevos: { fecha_apertura, saldo_inicial },
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

export async function cierreCaja({ fecha_cierre, saldo_final }, usuario_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const caja = await obtenerCajaAbierta(usuario_id);
    if (!caja) throw new Error("No hay caja abierta");

    await cerrarCaja(connection, caja.id, { fecha_cierre, saldo_final });

    await registrarLog({
      usuario_id,
      tabla: "cajas",
      accion_id: ACCIONES_LOG.UPDATE,
      descripcion: `Cierre de caja ID ${caja.id}`,
      registro_id: caja.id,
      datos_anteriores: caja,
      datos_nuevos: { fecha_cierre, saldo_final },
    });

    await connection.commit();
    connection.release();
    return caja.id;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

export async function movimientoCaja({ tipo, concepto, monto }, usuario_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const caja = await obtenerCajaAbierta(usuario_id);
    if (!caja) throw new Error("No hay caja abierta");

    const id = await registrarMovimientoCaja(connection, {
      caja_id: caja.id,
      tipo,
      concepto,
      monto,
      usuario_id,
    });

    await registrarLog({
      usuario_id,
      tabla: "movimientos_caja",
      accion_id: ACCIONES_LOG.INSERT,
      descripcion: `Movimiento de caja ID ${id}`,
      registro_id: id,
      datos_nuevos: { tipo, concepto, monto },
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

export async function movimientosDeCaja(usuario_id) {
  const caja = await obtenerCajaAbierta(usuario_id);
  if (!caja) throw new Error("No hay caja abierta");
  return await obtenerMovimientos(caja.id);
}
