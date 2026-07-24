import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import User from '../models/User';
import Chamados from '../models/Chamados';
import Distritos from '../models/distritos';
import Unidades from '../models/unidades';
import Equipamentos from '../models/equipamentos';

const models = [User, Chamados, Distritos, Unidades, Equipamentos];
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
