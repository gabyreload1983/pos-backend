import { Router } from "express";
import { pool } from "../config/db.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);

// GET /api/provincias
router.get(
  "/",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, nombre FROM provincias ORDER BY nombre ASC"
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener provincias" });
    }
  }
);

export default router;
