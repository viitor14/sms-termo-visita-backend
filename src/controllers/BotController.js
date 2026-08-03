import crypto from 'crypto';
import Requisitante from '../models/Requisitante';
import Chamados from '../models/Chamados';

class BotController {
  async verificarUsuario(req, res) {
    try {
      const { telefone } = req.body;
      if (!telefone) {
        return res.status(400).json({ error: 'Telefone não fornecido' });
      }

      const requisitante = await Requisitante.findOne({ where: { telefone } });
      
      if (!requisitante) {
        return res.json({ existe: false });
      }

      return res.json({ existe: true, nome: requisitante.nome, unidade: requisitante.unidade });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erro ao verificar requisitante' });
    }
  }

  async registrarUsuario(req, res) {
    try {
      const { telefone, nome, unidade } = req.body;
      if (!telefone || !nome || !unidade) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      const requisitante = await Requisitante.create({ telefone, nome, unidade });
      
      return res.json({ success: true, requisitante });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erro ao registrar requisitante' });
    }
  }

  async criarChamado(req, res) {
    try {
      const { telefone, problema } = req.body;
      
      const requisitante = await Requisitante.findOne({ where: { telefone } });
      if (!requisitante) {
        return res.status(400).json({ error: 'Requisitante não encontrado' });
      }

      const id = crypto.randomUUID();
      const novoChamado = await Chamados.create({
        id,
        unidade: requisitante.unidade,
        tecnico: 'Sem técnico atribuído',
        data: new Date().toLocaleDateString('pt-BR'),
        status: 'aberto',
        situacao: ['Criado via WhatsApp'],
        motivos: [problema || 'Suporte solicitado via WhatsApp'],
        obsTecnicas: `[Bot WhatsApp]\nSolicitante: ${requisitante.nome}\nTelefone: ${telefone}\nProblema: ${problema}`,
        responsavelNome: requisitante.nome,
        responsavelCargo: 'Requisitante',
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('novo_chamado', novoChamado);
      }

      return res.json({ success: true, chamado: novoChamado });
    } catch (e) {
      console.error('Erro ao criar chamado via bot:', e);
      return res.status(500).json({ error: 'Erro ao criar chamado via bot', details: e.message });
    }
  }
}

export default new BotController();

