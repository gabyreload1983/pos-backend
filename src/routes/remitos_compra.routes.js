// src/routes/remitos_compra.routes.js
import { Router } from "express";
import { createRemitoCompra } from "../controllers/remitos_compra.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";
import { validateDto } from "../middlewares/validateDto.js";
import { createRemitoCompraSchema } from "../dto/remitos_compra.dto.js";

const router = Router();

router.use(verificarToken);

router.post(
  "/",
  verificarRol([ROLES.ADMIN]),
  validateDto(createRemitoCompraSchema),
  createRemitoCompra
);

export default router;
