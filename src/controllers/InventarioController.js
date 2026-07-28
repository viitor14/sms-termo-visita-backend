import Distritos from '../models/distritos';
import Unidades from '../models/unidades';
import Equipamentos from '../models/equipamentos';

class InventarioController {
  // --- DISTRITOS ---
  async listarDistritos(req, res) {
    try {
      const distritos = await Distritos.findAll({
        include: [{
          model: Unidades,
          as: 'unidades',
          include: [{
            model: Equipamentos,
            as: 'equipamentos'
          }]
        }]
      });
      return res.status(200).json(distritos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar distritos' });
    }
  }

  async criarDistrito(req, res) {
    try {
      const { nome } = req.body;
      const novo = await Distritos.create({ nome });
      return res.status(201).json(novo);
    } catch (error) {
      console.error('Erro detalhado:', error);
      return res.status(400).json({ error: 'Erro ao criar distrito' });
    }
  }

  // --- UNIDADES ---
  async listarUnidades(req, res) {
    try {
      const unidades = await Unidades.findAll({
        include: [
          { model: Distritos, as: 'distrito' },
          { model: Equipamentos, as: 'equipamentos' }
        ]
      });
      return res.status(200).json(unidades);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar unidades' });
    }
  }

  async criarUnidade(req, res) {
    try {
      const { nome, distrito_id, endereco, gestora_nome, telefone } = req.body;
      const nova = await Unidades.create({ nome, distrito_id, endereco, gestora_nome, telefone });
      return res.status(201).json(nova);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao criar unidade' });
    }
  }

  async buscarUnidade(req, res) {
    try {
      const { id } = req.params;
      const unidade = await Unidades.findByPk(id, {
        include: [
          { model: Distritos, as: 'distrito' },
          { model: Equipamentos, as: 'equipamentos' }
        ]
      });
      if (!unidade) return res.status(404).json({ error: 'Unidade não encontrada' });
      return res.status(200).json(unidade);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar unidade' });
    }
  }

  async atualizarUnidade(req, res) {
    try {
      const { id } = req.params;
      const { nome, distrito_id, endereco, gestora_nome, telefone } = req.body;
      
      const unidade = await Unidades.findByPk(id);
      if (!unidade) return res.status(404).json({ error: 'Unidade não encontrada' });
      
      await unidade.update({ 
        nome, 
        distrito_id, 
        endereco, 
        gestora_nome, 
        telefone 
      });
      return res.status(200).json(unidade);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao atualizar unidade' });
    }
  }

  // --- EQUIPAMENTOS ---
  async criarEquipamento(req, res) {
    try {
      const { numero_serie, modelo, tipo, unidade_id, status_operacional, setor } = req.body;
      const novo = await Equipamentos.create({ 
        numero_serie, 
        modelo, 
        tipo, 
        setor: setor || 'Não Especificado',
        unidade_id,
        status_operacional: status_operacional || 'ativo'
      });
      return res.status(201).json(novo);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao criar equipamento (verifique se o numero de serie é unico)' });
    }
  }

  async atualizarEquipamento(req, res) {
    try {
      const { id } = req.params;
      const { unidade_id, status_operacional, modelo, tipo, numero_serie, setor } = req.body;
      
      const equipamento = await Equipamentos.findByPk(id);
      if (!equipamento) return res.status(404).json({ error: 'Equipamento não encontrado' });
      
      await equipamento.update({ 
        unidade_id, 
        status_operacional,
        modelo,
        tipo,
        numero_serie,
        setor
      });
      return res.status(200).json(equipamento);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao atualizar equipamento' });
    }
  }

  async excluirEquipamento(req, res) {
    try {
      const { id } = req.params;
      const equipamento = await Equipamentos.findByPk(id);
      if (!equipamento) return res.status(404).json({ error: 'Equipamento não encontrado' });
      
      await equipamento.destroy();
      return res.status(200).json({ message: 'Equipamento excluído com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir equipamento' });
    }
  }
}

export default new InventarioController();
