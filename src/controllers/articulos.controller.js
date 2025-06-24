import {
  listarArticulos,
  obtenerArticulo,
  nuevoArticulo,
  modificarArticulo,
  borrarArticulo,
} from "../services/articulos.service.js";

export async function getArticulos(req, res, next) {
  try {
    const articulos = await listarArticulos();
    res.json(articulos);
  } catch (error) {
    next(error);
  }
}

export async function getArticulo(req, res, next) {
  try {
    const articulo = await obtenerArticulo(req.params.id);
    if (!articulo)
      return res.status(404).json({ error: "Artículo no encontrado" });
    res.json(articulo);
  } catch (error) {
    next(error);
  }
}

export async function createArticulo(req, res, next) {
  try {
    const id = await nuevoArticulo(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}

export async function updateArticulo(req, res, next) {
  try {
    const updated = await modificarArticulo(
      req.params.id,
      req.body,
      req.user.id
    );
    if (!updated)
      return res.status(404).json({ error: "Artículo no encontrado" });
    res.json({ message: "Artículo actualizado" });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticulo(req, res, next) {
  try {
    const deleted = await borrarArticulo(req.params.id, req.user.id);
    if (!deleted)
      return res.status(404).json({ error: "Artículo no encontrado" });
    res.json({ message: "Artículo eliminado" });
  } catch (error) {
    next(error);
  }
}
