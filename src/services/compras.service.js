import { pool } from "../config/db.js";
import {
  crearCompra,
  insertarDetalleCompra,
  obtenerCompraPorId,
  obtenerCompras,
} from "../models/compras.model.js";
import {
  actualizarStock,
  obtenerComprasPorProveedor,
  registrarMovimientoStock,
} from "../models/stock.model.js";
import { registrarLog } from "../utils/logger.js";

export async function registrarCompra(data, usuario_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Crear cabecera
    const compra_id = await crearCompra(connection, {
      ...data,
      usuario_id,
    });

    // 2. Detalle de artículos
    await insertarDetalleCompra(connection, compra_id, data.items);

    // 3. Actualizar stock y registrar movimientos
    for (const item of data.items) {
      await actualizarStock(
        connection,
        item.articulo_id,
        data.sucursal_id,
        item.cantidad
      );

      await registrarMovimientoStock(connection, {
        articulo_id: item.articulo_id,
        sucursal_id: data.sucursal_id,
        cantidad: item.cantidad,
        compra_id,
      });
    }

    // 4. Auditoría
    await registrarLog({
      usuario_id,
      tabla: "compras",
      accion: "INSERT",
      descripcion: `Compra registrada ID ${compra_id}`,
      registro_id: compra_id,
      datos_nuevos: data,
    });

    await connection.commit();
    connection.release();

    return compra_id;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

export async function listarCompras() {
  return await obtenerCompras();
}

export async function getCompra(id) {
  return await obtenerCompraPorId(id);
}

export async function getComprasProveedor(proveedor_id) {
  return await obtenerComprasPorProveedor(proveedor_id);
}
