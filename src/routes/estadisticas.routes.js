import { Router } from "express";
import {
  getTopArticulos,
  getVentasPorDia,
} from "../controllers/estadisticas.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);

// Ruta para ventas por día
router.get(
  "/ventas-por-dia",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  getVentasPorDia
);

router.get(
  "/top-articulos",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  getTopArticulos
);

export default router;
