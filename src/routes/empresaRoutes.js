import { Router } from 'express';
import empresaController from '../controllers/EmpresaController';
import auth from '../middlewares/auth';
import roleRequired from '../middlewares/roleRequired';

const router = new Router();

router.get('/', auth, empresaController.index);
router.post('/', auth, roleRequired(['master', 'gestor']), empresaController.store);
router.delete('/:id', auth, roleRequired(['master', 'gestor']), empresaController.delete);

export default router;
