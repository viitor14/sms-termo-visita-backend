import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';

// Rate Limiter para prevenir ataques de força bruta ou DoS
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Limite ajustado para permitir tráfego local durante o teste mobile
  message: {
    error: 'Muitas requisições originadas deste IP, por favor tente novamente mais tarde.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Middleware de LGPD para anonimizar logs sensíveis em caso de erro
export const lgpdLogger = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    if (res.statusCode >= 400 && res.statusCode < 600) {
      // Mascarando IPs reais se formos logar
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const maskedIp = ip ? ip.replace(/\.\d+$/, '.***') : 'Unknown';
      console.error(`[LGPD-Log] Acesso bloqueado/erro no endpoint ${req.path}. IP originário: ${maskedIp}`);
      
      // Se houvesse payload sensível no body de logs, nós o limparíamos aqui.
    }
    originalSend.call(this, data);
  };
  next();
};

// Middleware que agrupa as camadas de segurança
export const applySecurityMiddlewares = (app) => {
  // Configura headers HTTP de segurança de forma a não bloquear testes em IPs locais (mobile)
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    hsts: process.env.NODE_ENV === 'production',
    crossOriginResourcePolicy: { policy: "cross-origin" } // Permite requisições de outros IPs (como o do app mobile)
  }));
  
  // Previne cross-site scripting (XSS) - Sanitização rigorosa
  app.use(xss());

  // Aplica log LGPD e anonimização
  app.use(lgpdLogger);

  // Aplica o rate limiting em todas as requisições de chamados
  app.use('/chamados', apiLimiter);
  app.use('/tokens', rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // Max 10 tentativas de login por minuto
    message: { error: 'Excesso de tentativas de login.' }
  }));
};
