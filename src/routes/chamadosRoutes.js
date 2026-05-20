import { Router } from 'express';
import chamadosController from '../controllers/ChamadosController';
import auth from '../middlewares/auth';

const router = new Router();

router.use(auth);

router.get('/', chamadosController.index);
router.post('/', chamadosController.store);
router.get('/:id', chamadosController.show);
router.patch('/:id', chamadosController.update);
export default router;
