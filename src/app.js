import dotenv from 'dotenv';

dotenv.config();

import './database';

import express from 'express';
import cors from 'cors';

import homeRoutes from './routes/homeRoutes';
import chamadosRoutes from './routes/chamadosRoutes';
import tokenRoutes from './routes/tokenRoutes';
import inventarioRoutes from './routes/inventarioRoutes';
import userRoutes from './routes/userRoutes';
import empresaRoutes from './routes/empresaRoutes';
import botRoutes from './routes/botRoutes';
import { applySecurityMiddlewares } from './middlewares/securityConfig';
import { seedMasterUser, seedEmpresas } from './database/seeds';

const whiteList = ['http://localhost:3000', 'http://localhost:5173', 'http://31.97.86.253:8082', 'http://31.97.86.253:3005'];

const corsOptions = {
  origin(origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    
    // Roda a seed para garantir que exista pelo menos um usuário master
    seedMasterUser();
    seedEmpresas();
  }

  middlewares() {
    this.app.use(cors(corsOptions));

    // Aplica as camadas de segurança blindando a aplicação (Security Persona)
    applySecurityMiddlewares(this.app);

    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  routes() {
    this.app.use('/', homeRoutes);
    this.app.use('/users', userRoutes);
    this.app.use('/chamados', chamadosRoutes);
    this.app.use('/tokens', tokenRoutes);
    this.app.use('/inventario', inventarioRoutes);
    this.app.use('/empresas', empresaRoutes);
    this.app.use('/webhook', botRoutes);
  }
}

export default new App().app;
