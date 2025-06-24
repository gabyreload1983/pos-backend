// src/middlewares/errorHandler.js

export function errorHandler(err, req, res, next) {
  // Errores de validación (Zod o personalizados)
  if (err.name === "ZodError" || err.status === 400) {
    return res.status(400).json({
      error: "Error de validación",
      detalles: err.errores || err.errors || [],
    });
  }

  // Otros errores conocidos con código
  if (err.status) {
    return res.status(err.status).json({
      error: err.message || "Error",
    });
  }

  // Errores inesperados
  console.error("Error inesperado:", err);
  res.status(500).json({
    error: "Error interno del servidor",
  });
}
