import Chamados from '../models/Chamados';
import Unidades from '../models/unidades';
import Equipamentos from '../models/equipamentos';
import { Sequelize } from 'sequelize';

class ChamadosController {
  // Método para CRIAR ou ATUALIZAR o chamado vindo do app (Sincronização)
  async store(req, res) {
    try {
      const { id, unidade, equipamento, numeroSerie } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'O ID do chamado é obrigatório.' });
      }

      const [chamado, created] = await Chamados.upsert(req.body);

      // --- Início: Auto-cadastro de Inventário ---
      try {
        if (unidade && numeroSerie && numeroSerie.trim() !== '' && numeroSerie.trim().toUpperCase() !== 'NÃO INFORMADO') {
          // 1. Busca ou cria a unidade
          const [unidadeRecord] = await Unidades.findOrCreate({
            where: { nome: unidade.trim() },
            defaults: { nome: unidade.trim(), distrito_id: null }
          });

          // 2. Busca ou cria o equipamento, vinculando à unidade
          const serialFormatado = numeroSerie.trim().toUpperCase();
          const tipoEquipamento = equipamento ? equipamento.trim() : 'Não Especificado';

          const [equip, equipCreated] = await Equipamentos.findOrCreate({
            where: { numero_serie: serialFormatado },
            defaults: {
              numero_serie: serialFormatado,
              modelo: tipoEquipamento,
              tipo: tipoEquipamento,
              setor: 'Não Especificado',
              unidade_id: unidadeRecord.id,
              status_operacional: 'ativo'
            }
          });
          
          // Se o equipamento já existia mas mudou de unidade, atualiza o vínculo
          if (!equipCreated && equip.unidade_id !== unidadeRecord.id) {
            await equip.update({ unidade_id: unidadeRecord.id });
          }
        }
      } catch (invError) {
        console.error('Erro não-crítico no auto-cadastro de inventário:', invError);
        // O erro é suprimido para não interromper a resposta de sucesso do chamado
      }
      // --- Fim: Auto-cadastro de Inventário ---

      const io = req.app.get('io');
      if (io) {
        if (created) {
          io.emit('novo_chamado', chamado);
        } else {
          io.emit('chamado_atualizado', chamado);
        }
      }

      return res.status(200).json({
        success: true,
        message: created ? 'Chamado criado com sucesso!' : 'Chamado atualizado!',
        chamado,
      });
    } catch (error) {
      console.error('Erro ao salvar chamado:', error);
      return res.status(400).json({
        error: 'Erro ao sincronizar o chamado.',
        detalhes: error.message,
      });
    }
  }

  async index(req, res) {
    try {
      const { status } = req.query;
      const where = {};
      if (status) {
        where.status = status;
      }

      const chamados = await Chamados.findAll({
        where,
        attributes: { exclude: ['imgAssinaturaResponsavel', 'imgAssinaturaTecnico'] },
        order: [
          [Sequelize.fn('STR_TO_DATE', Sequelize.col('data'), '%d/%m/%Y'), 'DESC'],
          ['chegada', 'DESC'],
        ],
      });
      return res.json(chamados);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar chamados.' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const chamado = await Chamados.findByPk(id);

      if (!chamado) {
        return res.status(404).json({ error: 'Chamado não encontrado.' });
      }

      return res.json(chamado);
    } catch (error) {
      console.error('Erro ao buscar detalhe do chamado:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { transferirEquipamento, unidade, ...rest } = req.body;
      const chamado = await Chamados.findByPk(id);

      if (!chamado) {
        return res.status(404).json({ error: 'Chamado não encontrado.' });
      }

      await chamado.update({ unidade, ...rest });

      // Se o usuário solicitou a transferência do equipamento
      if (transferirEquipamento && unidade && chamado.numeroSerie && chamado.numeroSerie.trim().toUpperCase() !== 'NÃO INFORMADO') {
        try {
          // 1. Busca ou cria a unidade de destino
          const [unidadeRecord] = await Unidades.findOrCreate({
            where: { nome: unidade.trim() },
            defaults: { nome: unidade.trim(), distrito_id: null }
          });
          
          // 2. Busca o equipamento pelo número de série associado ao chamado
          const serialFormatado = chamado.numeroSerie.trim().toUpperCase();
          const equip = await Equipamentos.findOne({ where: { numero_serie: serialFormatado }});
          
          if (equip && equip.unidade_id !== unidadeRecord.id) {
            await equip.update({ unidade_id: unidadeRecord.id });
          }
        } catch (invError) {
          console.error('Erro ao transferir inventário no update:', invError);
          // Suprime erro para não falhar a atualização do chamado
        }
      }

      const io = req.app.get('io');
      if (io) {
        io.emit('chamado_atualizado', chamado);
      }

      return res.json(chamado);
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const chamado = await Chamados.findByPk(id);

      if (!chamado) {
        return res.status(404).json({ error: 'Chamado não encontrado.' });
      }

      await chamado.destroy();

      const io = req.app.get('io');
      if (io) {
        io.emit('chamado_excluido', id);
      }

      return res.status(200).json({ success: true, message: 'Chamado excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir chamado:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new ChamadosController();
