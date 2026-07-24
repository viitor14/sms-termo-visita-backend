require('dotenv').config();
const { Sequelize } = require('sequelize');
const Chamados = require('./src/models/Chamados').default;

const sequelize = new Sequelize(process.env.DATABASE, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'mysql',
  port: process.env.DATABASE_PORT,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

Chamados.init(sequelize);

async function testFindAll() {
  try {
    await sequelize.authenticate();
    console.log('Conexão OK');
    const chamados = await Chamados.findAll({
      attributes: { exclude: ['imgAssinaturaResponsavel', 'imgAssinaturaTecnico'] },
      order: [
        [Sequelize.fn('STR_TO_DATE', Sequelize.col('data'), '%d/%m/%Y'), 'DESC'],
        ['chegada', 'DESC'],
      ],
    });
    console.log('Total chamados carregados via ORM:', chamados.length);
    if (chamados.length > 0) {
      console.log('Primeiro chamado:', chamados[0].toJSON());
    }
  } catch (error) {
    console.error('ERRO NO ORM:', error);
  } finally {
    await sequelize.close();
  }
}

testFindAll();
