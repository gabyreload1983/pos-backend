import { Router } from 'express';
import {
  getArticulos,
  getArticulo,
  createArticulo,
  updateArticulo,
  deleteArticulo
} from '../controllers/articulos.controller.js';

import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarRol } from '../middlewares/roles.middleware.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(verificarToken);

router.get('/', verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getArticulos);
router.get('/:id', verificarRol([ROLES.ADMIN, ROLES.VENDEDOR]), getArticulo);
router.post('/', verificarRol([ROLES.ADMIN]), createArticulo);
router.put('/:id', verificarRol([ROLES.ADMIN]), updateArticulo);
router.delete('/:id', verificarRol([ROLES.ADMIN]), deleteArticulo);

export default router;
