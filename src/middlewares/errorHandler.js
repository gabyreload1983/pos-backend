// src/middlewares/errorHandler.js

import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  // 1. Errores de Zod
  if (err instanceof ZodError) {
    const detalles = err.errors.map((e) => ({
      campo: e.path.join("."),
      mensaje: e.message,
    }));
    return res.status(400).json({
      error: "Error de validación",
      detalles,
    });
  }

  // 2. Errores personalizados con detalles de validación
  if (err.status === 400 && err.errores) {
    return res.status(400).json({
      error: "Error de validación",
      detalles: err.errores,
    });
  }

  // 3. Otros errores controlados con código HTTP
  if (err.status) {
    return res.status(err.status).json({
      error: err.message || "Error",
    });
  }

  // 4. Error inesperado
  console.error("Error inesperado:", err);

  return res.status(500).json({
    error: "Error interno del servidor",
  });
}
