require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'mysql',
  port: process.env.DATABASE_PORT,
  logging: false,
});

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT id, unidade, data, chegada, status FROM chamados ORDER BY created_at DESC;");
    console.table(results);
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
