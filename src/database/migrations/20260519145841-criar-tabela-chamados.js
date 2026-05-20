'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chamados', {
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
      // ✨ Nomes corrigidos para snake_case com underline!
      img_assinatura_responsavel: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      img_assinatura_tecnico: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      matricula: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      numero_serie: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      obs_tecnicas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      responsavel_cargo: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      responsavel_nome: {
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
      // O Sequelize também exige underline no createdAt e updatedAt
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('chamados');
  },
};
s;
