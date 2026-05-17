const { Router } = require('express');
const LocacaoController = require('../controllers/LocacaoController');
const authMiddleware = require('../middlewares/auth_middleware');

class LocacoesRoutes {
  constructor() {
    this.router = Router();
    this.locacaoController = new LocacaoController();
    this.register();
  }

  register() {
    this.router.get('/', authMiddleware, this.locacaoController.index);
  }
}

module.exports = new LocacoesRoutes().router;
