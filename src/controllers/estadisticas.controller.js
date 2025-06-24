import {
  topArticulos,
  topClientes,
  ventasPorDia,
} from "../services/estadisticas.service.js";

export async function getVentasPorDia(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const data = await ventasPorDia(desde, hasta);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getTopArticulos(req, res, next) {
  try {
    const { desde, hasta, limite } = req.query;
    const data = await topArticulos(desde, hasta, limite);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getTopClientes(req, res, next) {
  try {
    const { desde, hasta, limite } = req.query;
    const data = await topClientes(desde, hasta, limite);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
