import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';

// Rate Limiter para prevenir ataques de força bruta ou DoS
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 requisições por `window` (15 min)
  message: {
    error: 'Muitas requisições originadas deste IP, por favor tente novamente mais tarde.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Middleware que agrupa as camadas de segurança
export const applySecurityMiddlewares = (app) => {
  // Configura headers HTTP de segurança
  app.use(helmet());
  
  // Previne cross-site scripting (XSS)
  app.use(xss());

  // Aplica o rate limiting em todas as requisições de chamados
  app.use('/chamados', apiLimiter);
  app.use('/tokens', rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // Max 10 tentativas de login por minuto
    message: { error: 'Excesso de tentativas de login.' }
  }));
};
