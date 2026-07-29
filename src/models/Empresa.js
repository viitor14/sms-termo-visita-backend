import Sequelize, { Model } from 'sequelize';

export default class Empresa extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: Sequelize.STRING,
          defaultValue: '',
          validate: {
            notEmpty: {
              msg: 'Nome da empresa não pode ficar vazio.',
            },
          },
        },
      },
      {
        sequelize,
        tableName: 'empresas',
      }
    );

    return this;
  }
}
