import { ApiError } from "../utils/ApiError.js";

export function validateDto(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errores = result.error.errors.map((e) => ({
        campo: e.path.join("."),
        mensaje: e.message,
      }));
      return next(ApiError.validation(errores));
    }

    req.validatedData = result.data;
    next();
  };
}
