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
    this.router.get('/:id', authMiddleware, this.locacaoController.show);
    this.router.post('/', authMiddleware, this.locacaoController.store);
    this.router.patch('/:id/devolver', authMiddleware, this.locacaoController.devolver);
  }
}

module.exports = new LocacoesRoutes().router;
