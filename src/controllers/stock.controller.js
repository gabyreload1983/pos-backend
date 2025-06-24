import { listarStock, actualizarStock } from "../services/stock.service.js";

export async function getStock(req, res, next) {
  try {
    const stock = await listarStock();
    res.json(stock);
  } catch (error) {
    next(error);
  }
}

export async function putStock(req, res, next) {
  try {
    const { articulo_id, sucursal_id, cantidad } = req.body;
    await actualizarStock({ articulo_id, sucursal_id, cantidad }, req.user.id);
    res.json({ message: "Stock actualizado correctamente" });
  } catch (error) {
    next(error);
  }
}
