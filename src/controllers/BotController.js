import crypto from 'crypto';
import Sequelize, { Op } from 'sequelize';
import Requisitante from '../models/Requisitante';
import Chamados from '../models/Chamados';
import Unidades from '../models/unidades';
import Distritos from '../models/distritos';
import sendPushNotification from '../utils/sendPushNotification';

async function validarOuEncontrarUnidade(nomeUnidade) {
  if (!nomeUnidade) return null;
  const cleanName = String(nomeUnidade).trim();
  if (!cleanName) return null;

  // 1. Busca exata (case insensitive)
  let unit = await Unidades.findOne({
    where: Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('nome')),
      cleanName.toLowerCase()
    ),
  });
  if (unit) return unit;

  // 2. Busca parcial direta
  unit = await Unidades.findOne({
    where: {
      nome: { [Op.like]: `%${cleanName}%` },
    },
  });
  if (unit) return unit;

  // 3. Normalização de termos específicos (ex: "Camela", "Serrambi", "Porto de Galinhas", "Carozita", "Santo Cristo")
  const stopWords = ['posto', 'unidade', 'saude', 'secretaria', 'ipojuca', 'distrito', 'rede', 'municipal', 'brasil', 'aqui', 'estou', 'upa', 'usf', 'ubs', 'spa', 'policlinica', 'centro'];
  
  // Exceção direta para "Secretaria de Saúde" (ignorando acentuação)
  const normalizedClean = cleanName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalizedClean === 'secretaria de saude' || normalizedClean === 'sede' || normalizedClean === 'sms') {
    const sede = await Unidades.findOne({
      where: {
        nome: { [Op.like]: '%Secretaria%Sa%de%' },
      },
    });
    if (sede) return sede;
    return { nome: 'Secretaria de Saúde' };
  }

  const words = cleanName.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w.toLowerCase()));
  for (const word of words) {
    const candidate = await Unidades.findOne({
      where: {
        nome: { [Op.like]: `%${word}%` },
      },
    });
    if (candidate) {
      const lowerClean = cleanName.toLowerCase();
      const lowerCandidate = candidate.nome.toLowerCase();
      if (lowerClean.includes('upa') && !lowerCandidate.includes('upa')) continue;
      if (lowerClean.includes('policlinica') && !lowerCandidate.includes('policl')) continue;
      if (lowerClean.includes('usf') && !lowerCandidate.includes('usf')) continue;
      if (lowerClean.includes('spa') && !lowerCandidate.includes('spa')) continue;
      return candidate;
    }
  }

  return null;
}

class BotController {
  async listarUnidades(req, res) {
    try {
      const unidades = await Unidades.findAll({
        attributes: ['id', 'nome'],
        include: [{ model: Distritos, as: 'distrito', attributes: ['nome'] }],
        order: [['nome', 'ASC']],
      });
      return res.json({
        total: unidades.length,
        unidades: unidades.map(u => ({
          id: u.id,
          nome: u.nome,
          distrito: u.distrito ? u.distrito.nome : 'Sem distrito',
        })),
      });
    } catch (e) {
      console.error('Erro ao listar unidades para o bot:', e);
      return res.status(500).json({ error: 'Erro ao listar unidades' });
    }
  }

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

      const unidadeValida = await validarOuEncontrarUnidade(unidade);
      if (!unidadeValida) {
        const todasUnidades = await Unidades.findAll({ attributes: ['nome'], limit: 10 });
        return res.status(422).json({
          error: 'Unidade não encontrada no cadastro oficial da Secretaria de Saúde.',
          unidades_sugeridas: todasUnidades.map(u => u.nome),
        });
      }

      const requisitante = await Requisitante.create({
        telefone,
        nome: String(nome).trim(),
        unidade: unidadeValida.nome,
      });
      
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
        acao,
      } = req.body;

      if (!telefone) {
        return res.status(400).json({ error: 'Telefone é obrigatório' });
      }
      
      let requisitante = await Requisitante.findOne({ where: { telefone } });
      
      // Se veio unidade informada, validar contra o cadastro oficial
      let unidadeOficialNome = null;
      if (unidade) {
        const unidadeEncontrada = await validarOuEncontrarUnidade(unidade);
        if (unidadeEncontrada) {
          unidadeOficialNome = unidadeEncontrada.nome;
        } else if (!requisitante) {
          const todasUnidades = await Unidades.findAll({ attributes: ['nome'], limit: 10 });
          return res.status(422).json({
            error: 'Unidade não encontrada no cadastro oficial da Secretaria de Saúde.',
            unidade_informada: unidade,
            unidades_sugeridas: todasUnidades.map(u => u.nome),
          });
        }
      }

      // Auto-cadastro caso o requisitante ainda não exista no banco
      if (!requisitante) {
        if (nome && unidadeOficialNome) {
          requisitante = await Requisitante.create({
            telefone,
            nome: String(nome).trim(),
            unidade: unidadeOficialNome,
          });
        } else {
          return res.status(400).json({ error: 'Requisitante não encontrado e dados de nome/unidade válidos não fornecidos' });
        }
      } else {
        const updateData = {};
        if (unidadeOficialNome && requisitante.unidade !== unidadeOficialNome) {
          updateData.unidade = unidadeOficialNome;
        }
        if (nome && String(nome).trim() !== 'Solicitante' && requisitante.nome !== String(nome).trim()) {
          updateData.nome = String(nome).trim();
        }
        if (Object.keys(updateData).length > 0) {
          await requisitante.update(updateData);
        }
      }

      // Tratamento especial para apenas corrigir unidade/setor
      if (acao === 'corrigir_unidade' || acao === 'atualizar_unidade') {
        return res.json({ success: true, updated: true, requisitante });
      }

      const unidadeBase = unidadeOficialNome || (requisitante ? requisitante.unidade : 'Secretaria de Saúde');
      const unidadeFinal = setor 
        ? `${unidadeBase} - Setor ${String(setor).trim()}`
        : unidadeBase;

      // Normalização inteligente e sanitização do problema técnico (evita frases de conversa como 'fiz isso e nao voltou')
      let problemaFormatado = problema ? String(problema).trim() : '';
      const isVague = !problemaFormatado || /^(fiz|tentei|ja fiz|continua|nao deu|nao foi|continua sem funcionar|nao funcionou|nao resolveu|nao voltou|ok|ola|bom dia|boa tarde)/i.test(problemaFormatado);

      if (isVague) {
        if (categoria && /rede|internet|conectividade/i.test(categoria)) {
          if (setor && !/geral|unidade/i.test(setor)) {
            problemaFormatado = `Computador do setor ${setor} sem internet`;
          } else {
            problemaFormatado = 'Unidade sem Internet';
          }
        } else if (categoria && /impressora/i.test(categoria)) {
          problemaFormatado = (equipamento && equipamento !== 'Geral')
            ? `${equipamento} com defeito / sem imprimir`
            : 'Impressora com defeito';
        } else if (categoria && /sistema|esus|pec/i.test(categoria)) {
          problemaFormatado = 'Instabilidade no Sistema e-SUS / PEC';
        } else if (equipamento && equipamento !== 'Geral') {
          problemaFormatado = `${equipamento} com defeito relatado`;
        } else {
          problemaFormatado = 'Suporte Técnico - Manutenção Presencial';
        }
      }

      const id = crypto.randomUUID();
      const isResolvedByIA = (acao === 'resolver_chamado_ia');
      const situacaoTags = ['Criado via WhatsApp'];
      
      if (isResolvedByIA) {
        situacaoTags.push('Resolvido pela IA');
      }
      
      if (categoria) situacaoTags.push(String(categoria).trim());
      if (urgencia) situacaoTags.push(`Prioridade ${String(urgencia).toUpperCase()}`);

      const obsBloco = [
        '[Bot WhatsApp - Triagem RAG & Segurança]',
        `Solicitante: ${requisitante.nome}`,
        `Telefone: ${telefone}`,
        `Unidade: ${unidadeFinal}`,
        setor ? `Setor Específico: ${setor}` : null,
        categoria ? `Categoria: ${categoria}` : null,
        equipamento ? `Equipamento: ${equipamento}` : null,
        urgencia ? `Urgência: ${urgencia}` : null,
        `Problema Técnico: ${problemaFormatado}`,
        problema && problema !== problemaFormatado ? `Mensagem Original do Solicitante: ${problema}` : null,
        tentativa_rag ? `Tentativa Nível 1 (RAG): ${tentativa_rag}` : null,
      ].filter(Boolean).join('\n');

      const novoChamado = await Chamados.create({
        id,
        unidade: unidadeFinal,
        equipamento: equipamento ? String(equipamento).trim() : '',
        tecnico: isResolvedByIA ? 'Via (Inteligência Artificial)' : 'Sem técnico atribuído',
        data: new Date().toLocaleDateString('pt-BR'),
        status: isResolvedByIA ? 'concluido' : 'pendente',
        situacao: situacaoTags,
        motivos: [problemaFormatado],
        obsTecnicas: obsBloco,
        responsavelNome: requisitante.nome,
        responsavelCargo: 'Requisitante',
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('novo_chamado', novoChamado);
      }

      // Send push notification for new tickets
      sendPushNotification(
        `🚨 Novo Chamado (Bot): ${novoChamado.unidade}`,
        `${problemaFormatado}`,
        { chamadoId: novoChamado.id }
      );

      return res.json({ success: true, chamado: novoChamado, requisitante });
    } catch (e) {
      console.error('Erro ao criar chamado via bot:', e);
      return res.status(500).json({ error: 'Erro ao criar chamado via bot', details: e.message });
    }
  }
}

export default new BotController();
