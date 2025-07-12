import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function errorHandler(err, req, res, next) {
  // 1. Errores de Zod puros (no envueltos en ApiError)
  if (err instanceof ZodError) {
    const detalles = err.errors.map((e) => ({
      campo: e.path.join("."),
      mensaje: e.message,
    }));
    return res.status(422).json({
      error: "Error de validación",
      detalles,
    });
  }

  // 2. ApiError con detalles de validación (ApiError.validation)
  if (err instanceof ApiError && err.errores) {
    return res.status(err.status).json({
      error: err.message,
      detalles: err.errores,
    });
  }

  // 3. Otros ApiError estándar (sin detalles)
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  // 4. Error inesperado
  console.error("Error inesperado:", err);
  return res.status(500).json({
    error: "Error interno del servidor",
  });
}
