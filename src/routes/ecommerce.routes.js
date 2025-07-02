import { Router } from "express";
import {
  getArticulosPublicados,
  getArticuloPorSlug,
} from "../controllers/ecommerce.controller.js";
import { verificarApiToken } from "../middlewares/apiToken.middleware.js";

const router = Router();

// Aplica protección por token API (si querés exponer hacia afuera)
router.use(verificarApiToken);

router.get("/articulos", getArticulosPublicados);
router.get("/articulos/:slug", getArticuloPorSlug);

export default router;
