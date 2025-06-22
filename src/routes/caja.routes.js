import { Router } from "express";
import {
  abrir,
  cerrar,
  nuevoMovimiento,
  listarMovimientos,
} from "../controllers/caja.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);

router.post("/abrir", verificarRol([ROLES.ADMIN, ROLES.CAJERO]), abrir);
router.put("/cerrar", verificarRol([ROLES.ADMIN, ROLES.CAJERO]), cerrar);
router.post(
  "/movimiento",
  verificarRol([ROLES.ADMIN, ROLES.CAJERO]),
  nuevoMovimiento
);
router.get(
  "/movimientos",
  verificarRol([ROLES.ADMIN, ROLES.CAJERO]),
  listarMovimientos
);

export default router;
