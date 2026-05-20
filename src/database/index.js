import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import User from '../models/User';
import Chamados from '../models/Chamados';

const models = [User, Chamados];
const connection = new Sequelize(databaseConfig);

/*
Connrction para usar quando for espedar no site da render.
const connection = new Sequelize(databaseConfig.url, {
  dialect: databaseConfig.dialect,
  dialectOptions: databaseConfig.dialectOptions,
  define: databaseConfig.define,
});
*/

models.forEach((model) => model.init(connection));
models.forEach((model) => model.associate && model.associate(connection.models));
