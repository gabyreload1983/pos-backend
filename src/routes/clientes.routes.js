import { Router } from "express";
import {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../controllers/clientes.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";
import { validateDto } from "../middlewares/validateDto.js";
import {
  createClienteSchema,
  updateClienteSchema,
} from "../dto/cliente.dto.js";

const router = Router();

// Proteger todas las rutas
router.use(verificarToken);

// Rutas accesibles a ADMIN y VENDEDOR
router.get("/", verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getClientes);
router.get("/:id", verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getCliente);

router.post(
  "/",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  validateDto(createClienteSchema),
  createCliente
);
router.put(
  "/:id",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  validateDto(updateClienteSchema),
  updateCliente
);

// Solo ADMIN puede eliminar
router.delete("/:id", verificarRol([ROLES.ADMIN]), deleteCliente);

export default router;
