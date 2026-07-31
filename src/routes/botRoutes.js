import { Router } from 'express';
import BotController from '../controllers/BotController';

// Pode ser necessário importar o apiLimiter de segurança aqui, ou aplicar na app.js
const routes = new Router();

// Endpoint para n8n validar usuário
routes.post('/bot/verificar', BotController.verificarUsuario);

// Endpoint para n8n registrar novo usuário
routes.post('/bot/registrar', BotController.registrarUsuario);

// Endpoint para n8n registrar chamado
routes.post('/bot/chamado', BotController.criarChamado);

export default routes;
