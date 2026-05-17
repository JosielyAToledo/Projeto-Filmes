const { Router } = require('express');
const ClienteController = require('../controllers/ClienteController');
const authMiddleware = require('../middlewares/auth_middleware');

class ClientesRoutes {
  constructor() {
    this.router = Router();
    this.clienteController = new ClienteController();
    this.register();
  }

  register() {
    this.router.get('/', authMiddleware, this.clienteController.index);
  }
}

module.exports = new ClientesRoutes().router;
