const LogService = require('../services/LogService');

const logService = new LogService();

function logMiddleware(req, res, next) {
  const startedAt = new Date();
  const hrStartedAt = process.hrtime.bigint();

  res.on('finish', async () => {
    try {
      const elapsedMs = Number(process.hrtime.bigint() - hrStartedAt) / 1e6;

      await logService.registrar({
        endpoint: req.originalUrl,
        metodo: req.method,
        usuario: req.user ? req.user.email || String(req.user.id) : 'anonimo',
        acao: 'ACESSO_ROTA',
        tipoEvento: 'rota',
        descricao: `${req.method} ${req.originalUrl}`,
        timestamp: startedAt,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        statusCode: res.statusCode,
        tempoRespostaMs: Math.round(elapsedMs)
      });
    } catch (error) {
      console.error('Erro ao registrar log:', error.message);
    }
  });

  next();
}

module.exports = logMiddleware;
