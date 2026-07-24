import Sequelize, { Model } from 'sequelize';

export default class Equipamentos extends Model {
  static init(sequelize) {
    super.init(
      {
        numero_serie: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false,
        },
        modelo: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        tipo: Sequelize.STRING,
        setor: {
          type: Sequelize.STRING,
          defaultValue: 'Não Especificado',
        },
        status_operacional: {
          type: Sequelize.STRING,
          defaultValue: 'ativo',
        },
        unidade_id: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'equipamentos',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Unidades, { foreignKey: 'unidade_id', as: 'unidade' });
  }
}