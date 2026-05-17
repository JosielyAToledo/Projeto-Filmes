const { Router } = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth_middleware');
const validationMiddleware = require('../middlewares/validation_middleware');

class AuthRoutes {
  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.register();
  }

  register() {
    this.router.post('/registrar', validationMiddleware(['nome', 'email', 'senha']), this.authController.registrar);
    this.router.post('/login', validationMiddleware(['email', 'senha']), this.authController.login);
    this.router.post('/logout', authMiddleware, this.authController.logout);
  }
}

module.exports = new AuthRoutes().router;
