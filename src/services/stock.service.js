import {
  obtenerStockPorSucursal,
  obtenerStockArticuloSucursal,
  ajustarStock,
  crearRegistroStock
} from '../models/stock.model.js';
import { registrarLog } from '../utils/logger.js';

export async function listarStock() {
  return await obtenerStockPorSucursal();
}

export async function actualizarStock({ articulo_id, sucursal_id, cantidad }, usuario_id) {
  const existente = await obtenerStockArticuloSucursal(articulo_id, sucursal_id);

  if (existente) {
    await ajustarStock({ articulo_id, sucursal_id, cantidad });

    await registrarLog({
      usuario_id,
      tabla: 'stock',
      accion: 'UPDATE',
      descripcion: `Stock actualizado para artículo ${articulo_id} en sucursal ${sucursal_id}`,
      registro_id: existente.id,
      datos_anteriores: existente,
      datos_nuevos: { cantidad }
    });
  } else {
    const id = await crearRegistroStock({ articulo_id, sucursal_id, cantidad });

    await registrarLog({
      usuario_id,
      tabla: 'stock',
      accion: 'INSERT',
      descripcion: `Stock inicial cargado para artículo ${articulo_id} en sucursal ${sucursal_id}`,
      registro_id: id,
      datos_nuevos: { articulo_id, sucursal_id, cantidad }
    });
  }

  return true;
}
