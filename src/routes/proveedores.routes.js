import { Router } from "express";
import {
  getProveedores,
  getProveedor,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../controllers/proveedores.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { validateDto } from "../middlewares/validateDto.js";
import {
  createProveedorSchema,
  updateProveedorSchema,
} from "../dto/proveedor.dto.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);

router.get("/", verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getProveedores);
router.get("/:id", verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getProveedor);
router.post(
  "/",
  verificarRol([ROLES.ADMIN]),
  validateDto(createProveedorSchema),
  createProveedor
);
router.put(
  "/:id",
  verificarRol([ROLES.ADMIN]),
  validateDto(updateProveedorSchema),
  updateProveedor
);
router.delete("/:id", verificarRol([ROLES.ADMIN]), deleteProveedor);

export default router;
