require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./src/config/database');

const sequelize = new Sequelize(config);

async function up() {
  try {
    await sequelize.query('ALTER TABLE chamados ADD COLUMN tecnicoAuxiliar VARCHAR(255) DEFAULT ""');
    console.log('Column tecnicoAuxiliar added successfully');
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('Column tecnicoAuxiliar already exists.');
    } else {
      console.error('Error adding column:', error);
    }
  } finally {
    await sequelize.close();
  }
}

up();
