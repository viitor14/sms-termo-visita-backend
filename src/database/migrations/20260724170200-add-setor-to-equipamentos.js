'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('equipamentos', 'setor', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Não Especificado',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('equipamentos', 'setor');
  }
};
