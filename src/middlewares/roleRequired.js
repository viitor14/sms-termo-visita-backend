export default function roleRequired(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ errors: ['Perfil de usuário não identificado.'] });
    }

    if (rolesPermitidos.includes(req.userRole)) {
      return next();
    }

    return res.status(403).json({
      errors: ['Acesso negado. Você não tem permissão para realizar esta ação.'],
    });
  };
}
