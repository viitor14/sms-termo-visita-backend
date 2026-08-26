import Sequelize, { Model } from 'sequelize';

export default class PushToken extends Model {
  static init(sequelize) {
    super.init(
      {
        token: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        device_info: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'push_tokens',
      }
    );
    return this;
  }
}