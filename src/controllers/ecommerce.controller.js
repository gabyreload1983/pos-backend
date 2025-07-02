import {
  obtenerArticulosPublicadosService,
  obtenerArticuloPorSlugService,
} from "../services/articulos.service.js";
import { ApiError } from "../utils/ApiError.js";

export const getArticulosPublicados = async (req, res, next) => {
  try {
    const articulos = await obtenerArticulosPublicadosService();
    res.json(articulos);
  } catch (error) {
    next(error);
  }
};

export const getArticuloPorSlug = async (req, res, next) => {
  try {
    const articulo = await obtenerArticuloPorSlugService(req.params.slug);
    if (!articulo) {
      throw new ApiError("Artículo no encontrado", 404);
    }
    res.json(articulo);
  } catch (error) {
    next(error);
  }
};
