import { registrarRemitoCompra } from "../services/remitos_compra.service.js";

export async function createRemitoCompra(req, res, next) {
  try {
    const remito_id = await registrarRemitoCompra(
      req.validatedData,
      req.user.id
    );
    res.status(201).json({ remito_id });
  } catch (error) {
    next(error);
  }
}
