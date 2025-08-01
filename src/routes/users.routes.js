import { Router } from "express";
import {
  getProfile,
  login,
  register,
  updateUser,
} from "../controllers/users.controller.js";
import { verificarToken } from "./../middlewares/auth.middleware.js";
import { verificarRol } from "./../middlewares/roles.middleware.js";
import { ROLES } from "./../config/roles.js";
import { validateDto } from "../middlewares/validateDto.js";
import { actualizarUsuarioSchema, usuarioSchema } from "../dto/usuarios.dto.js";

const router = Router();

// POST /api/users/login
router.post("/login", login);

// POST /api/users/register
router.post(
  "/register",
  verificarToken,
  verificarRol([ROLES.ADMIN]),
  validateDto(usuarioSchema),
  register
);

router.get("/me", verificarToken, getProfile);

router.put("/:id", validateDto(actualizarUsuarioSchema), updateUser);

export default router;
