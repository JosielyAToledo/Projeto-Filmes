function adminMiddleware(req, res, next) {
  if (!req.user || req.user.tipo_usuario !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito ao administrador.' });
  }

  return next();
}

module.exports = adminMiddleware;
