import { Router } from 'express';
import BotController from '../controllers/BotController';

const routes = new Router();

// Endpoint para n8n listar unidades de saúde oficiais
routes.get('/bot/unidades', BotController.listarUnidades);

// Endpoint para n8n validar usuário
routes.post('/bot/verificar', BotController.verificarUsuario);

// Endpoint para n8n registrar novo usuário
routes.post('/bot/registrar', BotController.registrarUsuario);

// Endpoint para n8n registrar chamado
routes.post('/bot/chamado', BotController.criarChamado);

// Endpoint (Agrupador/Debouncer) para receber Webhooks da Evolution API
routes.post('/bot/webhook/evolution', BotController.receberWebhookEvolution);

export default routes;
