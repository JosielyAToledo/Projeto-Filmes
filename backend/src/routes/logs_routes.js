const { Router } = require('express');
const LogController = require('../controllers/LogController');
const authMiddleware = require('../middlewares/auth_middleware');

class LogsRoutes {
  constructor() {
    this.router = Router();
    this.logController = new LogController();
    this.register();
  }

  register() {
    this.router.get('/', authMiddleware, this.logController.index);
    this.router.get('/exportar/xml', authMiddleware, this.logController.exportarXML);
    this.router.get('/exportar/json', authMiddleware, this.logController.exportarJSON);
    this.router.get('/exportar/pdf', authMiddleware, this.logController.exportarPDF);
  }
}

module.exports = new LogsRoutes().router;
