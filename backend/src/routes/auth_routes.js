const { Router } = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth_middleware');
const adminMiddleware = require('../middlewares/admin_middleware');
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
    this.router.post('/recuperar-senha', validationMiddleware(['email', 'senha']), this.authController.recuperarSenha);
    this.router.post('/logout', authMiddleware, this.authController.logout);
    this.router.get('/usuarios', authMiddleware, adminMiddleware, this.authController.listarUsuarios);
    this.router.patch('/usuarios/:id/status', authMiddleware, adminMiddleware, validationMiddleware(['status']), this.authController.atualizarStatusUsuario);
    this.router.get('/admins', authMiddleware, adminMiddleware, this.authController.listarAdministradores);
    this.router.post('/admins', authMiddleware, adminMiddleware, validationMiddleware(['nome', 'email', 'senha']), this.authController.salvarAdministrador);
    this.router.put('/admins/:email', authMiddleware, adminMiddleware, validationMiddleware(['nome', 'email']), this.authController.salvarAdministrador);
    this.router.delete('/admins/:email', authMiddleware, adminMiddleware, this.authController.excluirAdministrador);
  }
}

module.exports = new AuthRoutes().router;
