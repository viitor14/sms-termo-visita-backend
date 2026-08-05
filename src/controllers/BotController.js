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
      const {
        telefone,
        problema,
        nome,
        unidade,
        setor,
        equipamento,
        categoria,
        urgencia,
        tentativa_rag,
      } = req.body;

      if (!telefone) {
        return res.status(400).json({ error: 'Telefone é obrigatório' });
      }
      
      let requisitante = await Requisitante.findOne({ where: { telefone } });
      
      // Auto-cadastro caso o requisitante ainda não exista no banco
      if (!requisitante) {
        if (nome && unidade) {
          requisitante = await Requisitante.create({
            telefone,
            nome: String(nome).trim(),
            unidade: String(unidade).trim(),
          });
        } else {
          return res.status(400).json({ error: 'Requisitante não encontrado e dados de nome/unidade não fornecidos' });
        }
      } else if (unidade && requisitante.unidade !== String(unidade).trim()) {
        // Atualiza a unidade caso o usuário tenha sido transferido de posto
        await requisitante.update({ unidade: String(unidade).trim() });
      }

      const unidadeFinal = setor 
        ? `${requisitante.unidade} - Setor ${String(setor).trim()}`
        : requisitante.unidade;

      const id = crypto.randomUUID();
      const situacaoTags = ['Criado via WhatsApp'];
      if (categoria) situacaoTags.push(String(categoria).trim());
      if (urgencia) situacaoTags.push(`Prioridade ${String(urgencia).toUpperCase()}`);

      const obsBloco = [
        '[Bot WhatsApp - Triagem RAG]',
        `Solicitante: ${requisitante.nome}`,
        `Telefone: ${telefone}`,
        `Unidade: ${unidadeFinal}`,
        setor ? `Setor Específico: ${setor}` : null,
        categoria ? `Categoria: ${categoria}` : null,
        equipamento ? `Equipamento: ${equipamento}` : null,
        urgencia ? `Urgência: ${urgencia}` : null,
        `Problema Relatado: ${problema || 'Suporte solicitado via WhatsApp'}`,
        tentativa_rag ? `Tentativa Nível 1 (RAG): ${tentativa_rag}` : null,
      ].filter(Boolean).join('\n');

      const novoChamado = await Chamados.create({
        id,
        unidade: unidadeFinal,
        equipamento: equipamento ? String(equipamento).trim() : '',
        tecnico: 'Sem técnico atribuído',
        data: new Date().toLocaleDateString('pt-BR'),
        status: 'pendente',
        situacao: situacaoTags,
        motivos: [problema || 'Suporte solicitado via WhatsApp'],
        obsTecnicas: obsBloco,
        responsavelNome: requisitante.nome,
        responsavelCargo: 'Requisitante',
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('novo_chamado', novoChamado);
      }

      return res.json({ success: true, chamado: novoChamado, requisitante });
    } catch (e) {
      console.error('Erro ao criar chamado via bot:', e);
      return res.status(500).json({ error: 'Erro ao criar chamado via bot', details: e.message });
    }
  }
}

export default new BotController();


