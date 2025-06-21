import {
  listarArticulos,
  obtenerArticulo,
  nuevoArticulo,
  modificarArticulo,
  borrarArticulo
} from '../services/articulos.service.js';

export async function getArticulos(req, res) {
  try {
    const articulos = await listarArticulos();
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los artículos' });
  }
}

export async function getArticulo(req, res) {
  try {
    const articulo = await obtenerArticulo(req.params.id);
    if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json(articulo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el artículo' });
  }
}

export async function createArticulo(req, res) {
  try {
    const id = await nuevoArticulo(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el artículo' });
  }
}

export async function updateArticulo(req, res) {
  try {
    const updated = await modificarArticulo(req.params.id, req.body, req.user.id);
    if (!updated) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json({ message: 'Artículo actualizado' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el artículo' });
  }
}

export async function deleteArticulo(req, res) {
  try {
    const deleted = await borrarArticulo(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json({ message: 'Artículo eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el artículo' });
  }
}
