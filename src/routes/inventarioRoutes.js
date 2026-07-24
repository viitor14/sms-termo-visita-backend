import { Router } from 'express';
import inventarioController from '../controllers/InventarioController';
// const auth = require('../middlewares/auth'); // Opcional se houver autenticação

const router = new Router();

router.get('/distritos', inventarioController.listarDistritos);
router.post('/distritos', inventarioController.criarDistrito);

router.get('/unidades', inventarioController.listarUnidades);
router.get('/unidades/:id', inventarioController.buscarUnidade);
router.post('/unidades', inventarioController.criarUnidade);

router.post('/equipamentos', inventarioController.criarEquipamento);
router.put('/equipamentos/:id', inventarioController.atualizarEquipamento);
router.delete('/equipamentos/:id', inventarioController.excluirEquipamento);

export default router;
