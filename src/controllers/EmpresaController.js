import Empresa from '../models/Empresa';

class EmpresaController {
  async index(req, res) {
    try {
      const empresas = await Empresa.findAll({
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']],
      });
      return res.json(empresas);
    } catch (e) {
      return res.status(400).json({ errors: e.errors ? e.errors.map(err => err.message) : ['Erro ao listar empresas'] });
    }
  }

  async store(req, res) {
    try {
      const novaEmpresa = await Empresa.create(req.body);
      return res.json(novaEmpresa);
    } catch (e) {
      return res.status(400).json({ errors: e.errors ? e.errors.map(err => err.message) : ['Erro ao criar empresa'] });
    }
  }

  async delete(req, res) {
    try {
      const empresa = await Empresa.findByPk(req.params.id);
      if (!empresa) {
        return res.status(404).json({ errors: ['Empresa não encontrada'] });
      }

      await empresa.destroy();
      return res.json({ message: 'Empresa deletada com sucesso' });
    } catch (e) {
      return res.status(400).json({ errors: e.errors ? e.errors.map(err => err.message) : ['Erro ao deletar empresa'] });
    }
  }
}

export default new EmpresaController();
