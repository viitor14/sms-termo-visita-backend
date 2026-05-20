import Sequelize, { Model } from 'sequelize';
import bcryptjs from 'bcryptjs';

export default class Chamados extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
        },
        unidade: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        chegada: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        saida: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        data: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        equipamento: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        imgAssinaturaResponsavel: {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },
        imgAssinaturaTecnico: {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },
        matricula: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        numeroSerie: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        obsTecnicas: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        responsavelCargo: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        responsavelNome: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        servico: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        tecnico: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        status: {
          type: Sequelize.STRING,
          defaultValue: 'concluido',
        },
        motivos: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        situacao: {
          type: Sequelize.JSON,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'chamados',
        timestamps: true,
      },
    );

    return this;
  }
}
