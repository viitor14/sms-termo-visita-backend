import Sequelize, { Model } from 'sequelize';

export default class Distritos extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'distritos',
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.Unidades, { foreignKey: 'distrito_id', as: 'unidades' });
  }
}