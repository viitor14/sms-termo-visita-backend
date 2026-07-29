import { Router } from 'express';
import userController from '../controllers/UserController';
import auth from '../middlewares/auth';
import roleRequired from '../middlewares/roleRequired';

const router = new Router();

// Rota para o próprio usuário alterar a senha
router.put('/me/password', auth, userController.updatePassword);

// Apenas MASTER pode gerenciar outros usuários
router.post('/', auth, roleRequired(['master']), userController.store);
router.get('/', auth, roleRequired(['master']), userController.index);
router.get('/:id', auth, roleRequired(['master']), userController.show);
router.put('/:id', auth, roleRequired(['master']), userController.update);
router.delete('/:id', auth, roleRequired(['master']), userController.delete);
router.put('/:id/reset-password', auth, roleRequired(['master']), userController.resetPassword);

export default router;
