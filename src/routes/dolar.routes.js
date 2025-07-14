import { Router } from "express";
import { getCotizacionDolarActual } from "../controllers/dolar.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken);
router.get("/cotizacion-dolar-actual", getCotizacionDolarActual);

export default router;
