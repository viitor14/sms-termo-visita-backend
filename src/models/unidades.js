import Sequelize, { Model } from 'sequelize';

export default class Unidades extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        distrito_id: Sequelize.INTEGER,
        endereco: Sequelize.STRING,
        gestora_nome: Sequelize.STRING,
        telefone: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'unidades',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Distritos, { foreignKey: 'distrito_id', as: 'distrito' });
    this.hasMany(models.Equipamentos, { foreignKey: 'unidade_id', as: 'equipamentos' });
  }
}