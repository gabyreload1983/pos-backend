import { Router } from "express";
import {
  getMovimientos,
  getMovimientosFiltrados,
  postMovimiento,
} from "../controllers/cuentas_corrientes.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);

router.get(
  "/:id/reportes",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  getMovimientosFiltrados
);
router.get("/:id", verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getMovimientos);
router.post("/", verificarRol([ROLES.ADMIN]), postMovimiento);

export default router;
