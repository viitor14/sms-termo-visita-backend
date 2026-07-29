import User from '../models/User';
import Empresa from '../models/Empresa';

export async function seedMasterUser() {
  try {
    const adminExists = await User.findOne({ where: { role: 'master' } });
    if (!adminExists) {
      await User.create({
        nome: 'Administrador Master',
        email: 'admin@sms.com',
        password: 'admin123',
        role: 'master',
      });
      console.log('Usuário master padrão criado: admin@sms.com / admin123');
    }
  } catch (error) {
    console.error('Erro ao fazer seed do usuário master:', error);
  }
}

export async function seedEmpresas() {
  try {
    const empresasIniciais = ['ArtJet', 'SAM', 'Consuma', 'Acesso Telecomunicações'];
    const contagem = await Empresa.count();
    
    if (contagem === 0) {
      const empresasData = empresasIniciais.map(nome => ({ nome }));
      await Empresa.bulkCreate(empresasData);
      console.log('Empresas iniciais criadas com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao fazer seed de empresas:', error);
  }
}
