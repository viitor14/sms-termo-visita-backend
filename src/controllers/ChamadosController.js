import Chamados from '../models/Chamados';

class ChamadosController {
  // Método para CRIAR ou ATUALIZAR o chamado vindo do app (Sincronização)
  async store(req, res) {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'O ID do chamado é obrigatório.' });
      }

      const [chamado, created] = await Chamados.upsert(req.body);

      return res.status(200).json({
        success: true,
        message: created ? 'Chamado criadoo!' : 'Chamado atualizado!',
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
      const chamados = await Chamados.findAll({
        order: [
          ['data', 'DESC'],
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
      const chamado = await Chamados.findByPk(id);

      if (!chamado) {
        return res.status(404).json({ error: 'Chamado não encontrado.' });
      }

      await chamado.update(req.body);
      return res.json(chamado);
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new ChamadosController();
