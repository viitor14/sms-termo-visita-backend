const { Sequelize, Op } = require('sequelize');
const config = require('./src/config/database.js');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
});

async function run() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT id, nome FROM unidades");
    console.log("All Units:", results);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

run();
