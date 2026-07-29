'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('chamados', 'empresa_encaminhada', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '',
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('chamados', 'empresa_encaminhada');
  },
};
