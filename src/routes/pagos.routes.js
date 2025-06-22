import { Router } from "express";
import { postPago } from "../controllers/pagos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);

router.post("/", verificarRol([ROLES.ADMIN]), postPago);

export default router;
