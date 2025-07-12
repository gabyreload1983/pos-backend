import { Router } from "express";
import {
  createCompra,
  getCompraById,
  getCompras,
  getComprasByProveedor,
  postCompraDesdeRemitos,
} from "../controllers/compras.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";
import { validateDto } from "../middlewares/validateDto.js";
import {
  createCompraDesdeRemitosSchema,
  createCompraSchema,
} from "../dto/compras.dto.js";

const router = Router();

router.use(verificarToken);

router.get(
  "/proveedor/:id",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  getComprasByProveedor
);
router.get("/:id", verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getCompraById);
router.get("/", verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getCompras);

router.post(
  "/desde-remitos",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  validateDto(createCompraDesdeRemitosSchema),
  postCompraDesdeRemitos
);

router.post(
  "/",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  validateDto(createCompraSchema),
  createCompra
);

export default router;
