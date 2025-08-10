import { Router } from "express";
import { getCotizacionActual } from "../controllers/cotizacionesMonedas.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken);
router.get("/cotizacion-actual", getCotizacionActual);

export default router;
