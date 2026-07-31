const { Sequelize, Model } = require('sequelize');

class Requisitante extends Model {
  static init(sequelize) {
    super.init(
      {
        telefone: Sequelize.STRING,
        nome: Sequelize.STRING,
        unidade: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'Requisitante',
        tableName: 'requisitantes',
      }
    );

    return this;
  }
}

module.exports = Requisitante;
