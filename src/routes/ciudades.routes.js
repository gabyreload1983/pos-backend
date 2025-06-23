import { Router } from "express";
import { pool } from "../config/db.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { verificarRol } from "../middlewares/roles.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(verificarToken);

// GET /api/ciudades?provincia_id=20
router.get(
  "/",
  verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]),
  async (req, res) => {
    const { provincia_id } = req.query;
    try {
      const [rows] = await pool.query(
        "SELECT id, nombre FROM ciudades WHERE provincia_id = ? ORDER BY nombre ASC",
        [provincia_id]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener ciudades" });
    }
  }
);

export default router;
