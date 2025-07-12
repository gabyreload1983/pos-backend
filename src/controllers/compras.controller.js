import {
  getCompra,
  getComprasProveedor,
  listarCompras,
  registrarCompra,
  registrarCompraDesdeRemitos,
} from "../services/compras.service.js";

export async function createCompra(req, res, next) {
  try {
    const compra_id = await registrarCompra(req.validatedData, req.user.id);
    res.status(201).json({ compra_id });
  } catch (error) {
    next(error);
  }
}

export async function postCompraDesdeRemitos(req, res, next) {
  try {
    const compra_id = await registrarCompraDesdeRemitos(
      req.validatedData,
      req.user.id
    );
    res.status(201).json({ id: compra_id });
  } catch (error) {
    next(error);
  }
}

export async function getCompras(req, res, next) {
  try {
    const data = await listarCompras();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getCompraById(req, res, next) {
  try {
    const data = await getCompra(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getComprasByProveedor(req, res, next) {
  try {
    const data = await getComprasProveedor(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
