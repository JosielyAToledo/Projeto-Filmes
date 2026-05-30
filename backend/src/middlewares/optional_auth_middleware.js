const jwt = require('jsonwebtoken');

function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'troque_esta_chave_em_producao');
  } catch (error) {
    // Public routes must stay public. Required auth is still handled by auth_middleware.
  }

  return next();
}

module.exports = optionalAuthMiddleware;
