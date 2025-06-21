import { Router } from "express";
import {
  getProfile,
  login,
  register,
} from "../controllers/users.controller.js";
import { verificarToken } from "./../middlewares/auth.middleware.js";

const router = Router();

// POST /api/users/login
router.post("/login", login);

// POST /api/users/register
router.post("/register", register); // podría estar protegido para uso admin

router.get("/me", verificarToken, getProfile);

export default router;
