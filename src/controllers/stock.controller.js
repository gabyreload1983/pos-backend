import { listarStock, actualizarStock } from "../services/stock.service.js";

export async function getStock(req, res) {
  try {
    const stock = await listarStock();
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el stock" });
  }
}

export async function putStock(req, res) {
  try {
    const { articulo_id, sucursal_id, cantidad } = req.body;
    await actualizarStock({ articulo_id, sucursal_id, cantidad }, req.user.id);
    res.json({ message: "Stock actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar el stock" });
  }
}
