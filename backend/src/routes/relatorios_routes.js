const { Router } = require('express');
const RelatorioController = require('../controllers/RelatorioController');
const authMiddleware = require('../middlewares/auth_middleware');

class RelatoriosRoutes {
  constructor() {
    this.router = Router();
    this.relatorioController = new RelatorioController();
    this.register();
  }

  register() {
    this.router.get('/json', authMiddleware, this.relatorioController.resumoJSON);
    this.router.get('/grafico-locacoes', authMiddleware, this.relatorioController.dadosGrafico);
    this.router.get('/pdf', authMiddleware, this.relatorioController.relatorioPDF);
  }
}

module.exports = new RelatoriosRoutes().router;
