import { Router } from 'express';
import PushTokenController from '../controllers/PushTokenController';

const routes = new Router();

routes.post('/', PushTokenController.store);

export default routes;
