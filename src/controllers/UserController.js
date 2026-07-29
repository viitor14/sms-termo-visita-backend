import User from '../models/User';

class UserController {
  async store(req, res) {
    try {
      // Força a senha padrão na criação
      req.body.password = 'ipojuca@2026';
      const novoUser = await User.create(req.body);
      const { id, nome, email, role } = novoUser;
      return res.status(201).json({ id, nome, email, role });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro desconhecido ao criar usuário'],
      });
    }
  }

  async index(req, res) {
    try {
      const users = await User.findAll({ attributes: ['id', 'nome', 'email', 'role'] });
      return res.json(users);
    } catch (e) {
      return res.json(null);
    }
  }

  async show(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não existe.'] });
      }
      const { id, nome, email, role } = user;
      return res.json({ id, nome, email, role });
    } catch (e) {
      return res.json(null);
    }
  }

  async update(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não existe.'] });
      }

      // Evita alterar a senha se o campo vier vazio
      const dados = { ...req.body };
      if (dados.password === '') {
        delete dados.password;
      }

      const novosDados = await user.update(dados);
      const { id, nome, email, role } = novosDados;
      return res.json({ id, nome, email, role });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro desconhecido ao atualizar usuário'],
      });
    }
  }

  async delete(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não existe.'] });
      }

      await user.destroy();
      return res.json({ message: 'Usuário apagado com sucesso.' });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro desconhecido ao apagar usuário'],
      });
    }
  }

  async updatePassword(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não encontrado.'] });
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ errors: ['Você precisa informar a senha atual e a nova senha.'] });
      }

      if (!(await user.passwordIsValid(oldPassword))) {
        return res.status(401).json({ errors: ['A senha atual está incorreta.'] });
      }

      const novosDados = await user.update({ password: newPassword });
      const { id, nome, email, role } = novosDados;
      
      return res.json({ id, nome, email, role, message: 'Senha atualizada com sucesso.' });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro ao atualizar senha'],
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não encontrado.'] });
      }

      await user.update({ password: 'ipojuca@2026' });
      
      return res.json({ message: 'Senha resetada para o padrão (ipojuca@2026) com sucesso.' });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro ao resetar senha'],
      });
    }
  }
}

export default new UserController();
