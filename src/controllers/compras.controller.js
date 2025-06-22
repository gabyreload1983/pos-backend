import {
  getCompra,
  getComprasProveedor,
  listarCompras,
  registrarCompra,
} from "../services/compras.service.js";

export async function createCompra(req, res) {
  try {
    const compra_id = await registrarCompra(req.body, req.user.id);
    res.status(201).json({ compra_id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getCompras(req, res) {
  try {
    const data = await listarCompras();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las compras" });
  }
}

export async function getCompraById(req, res) {
  try {
    const data = await getCompra(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: "Compra no encontrada" });
  }
}

export async function getComprasByProveedor(req, res) {
  try {
    const data = await getComprasProveedor(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: "Error al obtener compras del proveedor" });
  }
}
