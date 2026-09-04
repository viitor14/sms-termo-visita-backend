import User from '../models/User';
import Empresa from '../models/Empresa';

export async function seedMasterUser() {
  try {
    const adminExists = await User.findOne({ where: { role: 'master' } });
    if (!adminExists) {
      const senhaPadrao = process.env.DEFAULT_MASTER_PASSWORD || Math.random().toString(36).slice(-10);
      await User.create({
        nome: 'Administrador Master',
        email: 'admin@sms.com',
        password: senhaPadrao,
        role: 'master',
      });
      console.log(`Usuário master padrão criado: admin@sms.com / ${senhaPadrao}`);
      if (!process.env.DEFAULT_MASTER_PASSWORD) {
        console.warn('⚠️ AVISO DE SEGURANÇA: Senha padrão gerada aleatoriamente. Por favor, anote-a e mude o quanto antes.');
      }
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
