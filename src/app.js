import dotenv from 'dotenv';

dotenv.config();

import './database';

import express from 'express';
import cors from 'cors';

import homeRoutes from './routes/homeRoutes';
import chamadosRoutes from './routes/chamadosRoutes';
import tokenRoutes from './routes/tokenRoutes';

const whiteList = ['http://localhost:3000'];

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
  }

  middlewares() {
    this.app.use(cors(corsOptions));
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  routes() {
    this.app.use('/', homeRoutes);
    //this.app.use('/users/', userRoutes);
    this.app.use('/chamados', chamadosRoutes);
    this.app.use('/tokens/', tokenRoutes);
  }
}

export default new App().app;
