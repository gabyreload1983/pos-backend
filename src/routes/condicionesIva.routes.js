import { Router } from "express";
import { getCondicionesIva } from "../controllers/condicionesIva.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);
router.get("/", verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getCondicionesIva);

export default router;
