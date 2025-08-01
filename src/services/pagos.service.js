import { pool } from "../config/db.js";
import { crearPago } from "../models/pagos.model.js";
import { registrarMovimientoConSaldo } from "../models/cuentas_corrientes.model.js";
import { registrarLog } from "../utils/logger.js";
import { obtenerCajaAbierta } from "../models/cajas.model.js";
import { ACCIONES_LOG } from "../constants/index.js";

export async function registrarPago(data, usuario_id, sucursal_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const caja = await obtenerCajaAbierta(sucursal_id);
    if (!caja) throw new Error("No hay caja abierta en esta sucursal");

    const pago_id = await crearPago(connection, {
      ...data,
      usuario_id,
      caja_id: caja.id,
    });

    const movimiento = {
      cliente_id: data.cliente_id,
      fecha: data.fecha,
      tipo: "haber",
      concepto: `Pago por ${data.metodo_pago}`,
      monto: data.monto,
    };

    const [rows] = await connection.query(
      "SELECT saldo FROM cuentas_corrientes WHERE cliente_id = ? ORDER BY fecha DESC, id DESC LIMIT 1",
      [data.cliente_id]
    );

    const saldoAnterior = rows[0]?.saldo || 0;
    const nuevoSaldo = saldoAnterior - data.monto;

    await registrarMovimientoConSaldo(connection, {
      ...movimiento,
      saldo: nuevoSaldo,
    });

    await registrarLog({
      usuario_id,
      tabla: "pagos",
      accion_id: ACCIONES_LOG.INSERT,
      descripcion: `Pago registrado ID ${pago_id}`,
      registro_id: pago_id,
      datos_nuevos: data,
    });

    await connection.commit();
    connection.release();

    return pago_id;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}
