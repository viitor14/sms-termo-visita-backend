export default (req, res, next) => {
  // Puxa a chave enviada no cabeçalho da requisição
  const apiKeyRecebida = req.headers['x-api-key'];

  const CHAVE_OFICIAL = process.env.TOKEN_SECRET;
  if (!apiKeyRecebida || apiKeyRecebida !== CHAVE_OFICIAL) {
    return res.status(401).json({
      errors: ['Acesso não autorizado. API Key ausente ou inválida.'],
    });
  }

  return next();
};
