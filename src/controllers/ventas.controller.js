import {
  registrarVenta,
  listarVentas,
  obtenerVenta,
} from "../services/ventas.service.js";

export async function getVentas(req, res, next) {
  try {
    const ventas = await listarVentas();
    res.json(ventas);
  } catch (error) {
    next(error);
  }
}

export async function getVenta(req, res, next) {
  try {
    const venta = await obtenerVenta(req.params.id);
    if (!venta) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(venta);
  } catch (error) {
    next(error);
  }
}

export async function createVenta(req, res, next) {
  try {
    const venta_id = await registrarVenta(
      req.validatedData,
      req.user.id,
      req.sucursal_id
    );
    res.status(201).json({ venta_id });
  } catch (error) {
    next(error);
  }
}
