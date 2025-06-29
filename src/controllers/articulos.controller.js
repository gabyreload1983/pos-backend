import * as service from "../services/articulos.service.js";
import { ApiError } from "../utils/ApiError.js";

export const getArticulos = async (req, res, next) => {
  try {
    const articulos = await service.obtenerArticulosService();
    res.json(articulos);
  } catch (error) {
    next(error);
  }
};

export const getArticulo = async (req, res, next) => {
  try {
    const articulo = await service.obtenerArticuloService(req.params.id);
    if (!articulo || articulo.activo === 0) {
      throw new ApiError("Artículo no encontrado", 404);
    }
    res.json(articulo);
  } catch (error) {
    next(error);
  }
};

export const createArticulo = async (req, res, next) => {
  try {
    const id = await service.crearArticuloService(
      req.validatedData,
      req.user.id
    );
    const nuevo = await service.obtenerArticuloService(id);
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
};

export const updateArticulo = async (req, res, next) => {
  try {
    const existe = await service.obtenerArticuloService(req.params.id);
    if (!existe || existe.activo === 0) {
      throw new ApiError("Artículo no encontrado", 404);
    }
    await service.actualizarArticuloService(
      req.params.id,
      req.validatedData,
      req.user.id
    );
    const actualizado = await service.obtenerArticuloService(req.params.id);
    res.json(actualizado);
  } catch (error) {
    next(error);
  }
};

export const deleteArticulo = async (req, res, next) => {
  try {
    const existe = await service.obtenerArticuloService(req.params.id);
    if (!existe || existe.activo === 0) {
      throw new ApiError("Artículo no encontrado", 404);
    }
    await service.eliminarArticuloService(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
