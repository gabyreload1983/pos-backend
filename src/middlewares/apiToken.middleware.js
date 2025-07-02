// middlewares/apiToken.middleware.js
import { ApiError } from "../utils/ApiError.js";

export function verificarApiToken(req, res, next) {
  const token = req.headers["x-api-key"];
  const tokenValido = process.env.API_ECOMMERCE_TOKEN;

  if (!token || token !== tokenValido) {
    throw new ApiError("Acceso no autorizado", 401);
  }

  next();
}
