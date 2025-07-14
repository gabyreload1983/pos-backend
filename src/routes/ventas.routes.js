import { Router } from "express";
import {
  getVentas,
  getVenta,
  createVenta,
} from "../controllers/ventas.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";
import { verificarSucursal } from "../middlewares/sucursal.middleware.js";
import { validateDto } from "../middlewares/validateDto.js";
import { ventaSchema } from "../dto/ventaSchema.js";

const router = Router();

router.use(verificarToken);

router.get("/", verificarRol([ROLES.ADMIN, ROLES.CAJERO]), getVentas);
router.get("/:id", verificarRol([ROLES.ADMIN, ROLES.CAJERO]), getVenta);
router.post(
  "/",
  verificarRol([ROLES.ADMIN, ROLES.CAJERO]),
  verificarSucursal,
  validateDto(ventaSchema),
  createVenta
);

export default router;
