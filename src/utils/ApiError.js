export class ApiError extends Error {
  constructor(message, status = 500, errores = []) {
    super(message);
    this.status = status;
    this.errores = errores;
  }

  static validation(errores) {
    return new ApiError("Error de validación", 400, errores);
  }

  static notFound(mensaje = "Recurso no encontrado") {
    return new ApiError(mensaje, 404);
  }

  static unauthorized(mensaje = "Acceso no autorizado") {
    return new ApiError(mensaje, 401);
  }
}
