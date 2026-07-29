import { Router } from 'express';
import inventarioController from '../controllers/InventarioController';
import auth from '../middlewares/auth';
import roleRequired from '../middlewares/roleRequired';

const router = new Router();

// GET routes (open to all authenticated users)
router.get('/distritos', auth, inventarioController.listarDistritos);
router.get('/unidades', auth, inventarioController.listarUnidades);
router.get('/unidades/:id', auth, inventarioController.buscarUnidade);

// POST, PUT, DELETE routes (restricted to master and gestor)
router.post('/distritos', auth, roleRequired(['master', 'gestor']), inventarioController.criarDistrito);
router.post('/unidades', auth, roleRequired(['master', 'gestor']), inventarioController.criarUnidade);
router.put('/unidades/:id', auth, roleRequired(['master', 'gestor']), inventarioController.atualizarUnidade);
router.post('/equipamentos', auth, roleRequired(['master', 'gestor']), inventarioController.criarEquipamento);
router.put('/equipamentos/:id', auth, roleRequired(['master', 'gestor']), inventarioController.atualizarEquipamento);
router.delete('/equipamentos/:id', auth, roleRequired(['master', 'gestor']), inventarioController.excluirEquipamento);

export default router;
