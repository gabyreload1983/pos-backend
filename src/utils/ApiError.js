export class ApiError extends Error {
  constructor(message, status = 500, errores = null) {
    super(message);
    this.status = status;
    this.errores = errores; // puede ser null o array
  }

  static validation(errores) {
    return new ApiError("Error de validación", 422, errores);
  }

  static badRequest(mensaje = "Solicitud incorrecta") {
    return new ApiError(mensaje, 400);
  }

  static unauthorized(mensaje = "No autorizado") {
    return new ApiError(mensaje, 401);
  }

  static notFound(mensaje = "Recurso no encontrado") {
    return new ApiError(mensaje, 404);
  }

  static conflict(mensaje = "Conflicto de datos") {
    return new ApiError(mensaje, 409);
  }

  static forbidden(mensaje = "Acceso no autorizado") {
    return new ApiError(mensaje, 403);
  }
}
