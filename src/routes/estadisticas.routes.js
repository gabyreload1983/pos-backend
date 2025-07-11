import { Router } from "express";
import {
  getTopArticulos,
  getTopClientes,
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

router.get(
  "/top-clientes",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  getTopClientes
);

export default router;
