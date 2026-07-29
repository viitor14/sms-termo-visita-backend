import { Router } from 'express';
import chamadosController from '../controllers/ChamadosController';
import auth from '../middlewares/auth';
import roleRequired from '../middlewares/roleRequired';

const router = new Router();

router.use(auth);

router.get('/', chamadosController.index);
router.post('/', roleRequired(['master', 'gestor', 'tecnico']), chamadosController.store);
router.get('/:id', chamadosController.show);
router.patch('/:id', chamadosController.update);
router.delete('/:id', roleRequired(['master', 'gestor', 'tecnico']), chamadosController.delete);
export default router;
