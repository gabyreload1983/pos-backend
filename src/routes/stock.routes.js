import { Router } from 'express';
import { getStock, putStock } from '../controllers/stock.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarRol } from '../middlewares/roles.middleware.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(verificarToken);

router.get('/', verificarRol([ROLES.ADMIN, ROLES.CAJERO]), getStock);
router.put('/', verificarRol([ROLES.ADMIN]), putStock);

export default router;
