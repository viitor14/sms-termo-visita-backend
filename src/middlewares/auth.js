import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User';

export default async (req, res, next) => {
  // 1. Tenta validar via JWT (Painel Web)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [, token] = authHeader.split(' ');
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET);
      
      // Busca no banco para verificar se o usuário ainda existe e pegar o role atual
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ errors: ['Usuário inválido.'] });
      }

      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.userRole = user.role; // injeta o role na requisição
      return next();
    } catch (e) {
      return res.status(401).json({ errors: ['Token expirado ou inválido.'] });
    }
  }

  // 2. Se não tem JWT, tenta validar via API Key (App Mobile)
  const apiKeyRecebida = req.headers['x-api-key'];
  const CHAVE_OFICIAL = process.env.MOBILE_API_KEY;

  if (!CHAVE_OFICIAL) {
    console.warn("[Segurança] MOBILE_API_KEY não está configurada no .env!");
  }

  if (apiKeyRecebida && apiKeyRecebida === CHAVE_OFICIAL) {
    // Acesso via App Mobile
    req.userId = 'app';
    req.userRole = 'tecnico'; // App mobile atua basicamente como técnico
    return next();
  }

  // 3. Sem Token e sem API Key
  return res.status(401).json({
    errors: ['Acesso não autorizado. Autenticação ausente ou inválida.'],
  });
};
