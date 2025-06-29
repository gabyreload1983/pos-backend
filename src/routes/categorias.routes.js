import { Router } from "express";
import { getCategorias } from "../controllers/categorias.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);
router.get("/", verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getCategorias);

export default router;
