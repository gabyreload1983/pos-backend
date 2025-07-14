import { usuarioTieneAccesoASucursal } from "../models/usuarios_sucursales.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function verificarSucursal(req, res, next) {
  const sucursal_id = Number(req.headers["x-sucursal-id"]);

  if (!sucursal_id) {
    return next(new ApiError("Sucursal no especificada", 400));
  }

  const usuario_id = req.user.id;

  const tieneAcceso = await usuarioTieneAccesoASucursal(
    usuario_id,
    sucursal_id
  );

  if (!tieneAcceso) {
    return next(new ApiError("No tiene acceso a esta sucursal", 403));
  }

  // Sucursal validada y accesible → guardamos en la request
  req.sucursal_id = sucursal_id;

  next();
}
