import { Router } from "express";
import { postArqueo, getArqueos } from "../controllers/arqueo.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);

router.get("/", verificarRol([ROLES.ADMIN, ROLES.CAJERO]), getArqueos);
router.post("/", verificarRol([ROLES.ADMIN, ROLES.CAJERO]), postArqueo);

export default router;
