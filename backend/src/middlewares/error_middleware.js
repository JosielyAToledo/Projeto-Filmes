const LogService = require('../services/LogService');

const logService = new LogService();

async function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  console.error(error);

  try {
    await logService.registrar({
      endpoint: req.originalUrl,
      metodo: req.method,
      usuario: req.user ? req.user.email || String(req.user.id) : 'anonimo',
      acao: 'ERRO',
      tipoEvento: 'erro',
      descricao: error.message,
      erro: error.message,
      stackTrace: error.stack,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      statusCode
    });
  } catch (logError) {
    console.error('Erro ao registrar excecao:', logError.message);
  }

  return res.status(statusCode).json({
    message: error.message || 'Erro interno do servidor.'
  });
}

module.exports = errorMiddleware;
