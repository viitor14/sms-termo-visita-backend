import PushToken from '../models/PushToken';

class PushTokenController {
  async store(req, res) {
    try {
      const { token, device_info } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token é obrigatório.' });
      }

      // Procura se já existe, se não, cria
      const [pushToken, created] = await PushToken.findOrCreate({
        where: { token },
        defaults: { token, device_info: device_info || 'Mobile App' },
      });

      return res.json({ success: true, pushToken, created });
    } catch (e) {
      console.error('Erro ao registrar push token:', e);
      return res.status(500).json({ error: 'Erro interno ao registrar token.' });
    }
  }
}

export default new PushTokenController();
