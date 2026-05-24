const jwt = require('jsonwebtoken');
const { isLocalMode } = require('../config/local_mode');

function allowLocalAdmin(req, next) {
  req.user = {
    id: 1,
    nome: 'Administrador',
    email: 'admin@catalogo7.com',
    tipo_usuario: 'admin'
  };

  return next();
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    if (isLocalMode()) {
      return allowLocalAdmin(req, next);
    }

    return res.status(401).json({ message: 'Token nao informado.' });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    if (isLocalMode()) {
      return allowLocalAdmin(req, next);
    }

    return res.status(401).json({ message: 'Formato do token invalido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'troque_esta_chave_em_producao');
    req.user = decoded;
    return next();
  } catch (error) {
    if (isLocalMode()) {
      return allowLocalAdmin(req, next);
    }

    return res.status(401).json({ message: 'Token invalido ou expirado.' });
  }
}

module.exports = authMiddleware;
