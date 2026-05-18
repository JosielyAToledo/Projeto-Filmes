const { Router } = require('express');
const ClienteController = require('../controllers/ClienteController');
const authMiddleware = require('../middlewares/auth_middleware');
const validationMiddleware = require('../middlewares/validation_middleware');

class ClientesRoutes {
  constructor() {
    this.router = Router();
    this.clienteController = new ClienteController();
    this.register();
  }

  register() {
    this.router.get('/', authMiddleware, this.clienteController.index);
    this.router.get('/:id', authMiddleware, this.clienteController.show);
    this.router.post('/', authMiddleware, validationMiddleware(['nome']), this.clienteController.store);
    this.router.put('/:id', authMiddleware, validationMiddleware(['nome']), this.clienteController.update);
    this.router.delete('/:id', authMiddleware, this.clienteController.destroy);
  }
}

module.exports = new ClientesRoutes().router;
