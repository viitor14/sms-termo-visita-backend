'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('unidades', 'endereco', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('unidades', 'gestora_nome', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('unidades', 'telefone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('unidades', 'endereco');
    await queryInterface.removeColumn('unidades', 'gestora_nome');
    await queryInterface.removeColumn('unidades', 'telefone');
  }
};
