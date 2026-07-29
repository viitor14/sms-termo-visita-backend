const Sequelize = require('sequelize');
const config = require('./src/config/database.js');
const sequelize = new Sequelize(config.database, config.username, config.password, config);

async function run() {
  try {
    await sequelize.query("UPDATE usuarios SET role = 'tecnico' WHERE role = 'visualizador'");
    console.log("Usuarios atualizados com sucesso.");
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    process.exit();
  }
}
run();
