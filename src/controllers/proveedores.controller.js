import {
  obtenerProveedores,
  obtenerProveedorPorId,
  nuevoProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from "../services/proveedores.service.js";
import { ApiError } from "../utils/ApiError.js";

export async function getProveedores(req, res, next) {
  try {
    const proveedores = await obtenerProveedores();
    res.json(proveedores);
  } catch (err) {
    next(err);
  }
}

export async function getProveedor(req, res, next) {
  try {
    const proveedor = await obtenerProveedorPorId(req.params.id);
    res.json(proveedor);
  } catch (err) {
    next(err);
  }
}

export async function createProveedor(req, res, next) {
  try {
    const proveedorData = req.validatedData;
    const id = await nuevoProveedor(proveedorData, req.user.id);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function updateProveedor(req, res, next) {
  try {
    const proveedorData = req.validatedData;
    const actualizado = await actualizarProveedor(
      req.params.id,
      proveedorData,
      req.user.id
    );
    if (!actualizado) throw new ApiError("Proveedor no encontrado", 404);

    res.json({ message: "Proveedor actualizado" });
  } catch (err) {
    next(err);
  }
}

export async function deleteProveedor(req, res, next) {
  try {
    const eliminado = await eliminarProveedor(req.params.id);
    if (!eliminado) throw new ApiError("Proveedor no encontrado", 404);

    res.json({ message: "Proveedor eliminado" });
  } catch (err) {
    next(err);
  }
}
