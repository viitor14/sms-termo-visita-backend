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

      // O modelo Chamados espera: unidade, tecnico, data, problema, observacao, situacao, empresaEncaminhada
      const novoChamado = await Chamados.create({
        unidade: requisitante.unidade,
        tecnico: 'Sem técnico atribuído',
        data: new Date().toLocaleDateString('pt-BR'), // Formato esperado pelo front/app (DD/MM/YYYY)
        problema: problema,
        situacao: 'Criado via WhatsApp',
        observacao: `[Bot WhatsApp] - Solicitante: ${requisitante.nome}`,
      });

      return res.json({ success: true, chamado: novoChamado });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erro ao criar chamado via bot' });
    }
  }
}

export default new BotController();
