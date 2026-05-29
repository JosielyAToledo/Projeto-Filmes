const AuthService = require('../services/AuthService');
const LogService = require('../services/LogService');

class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.logService = new LogService();
  }

  registrar = async (req, res, next) => {
    try {
      const usuario = await this.authService.registrar(req.body);
      return res.status(201).json(usuario);
    } catch (error) {
      return next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, senha } = req.body;
      const result = await this.authService.login(email, senha);
      await this.logService.registrar({
        usuario: email,
        acao: 'LOGIN',
        tipoEvento: 'autenticacao',
        descricao: 'Usuario autenticado com sucesso',
        sucesso: true,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.json(result);
    } catch (error) {
      await this.logService.registrar({
        usuario: req.body.email || 'anonimo',
        acao: 'LOGIN',
        tipoEvento: 'autenticacao',
        descricao: 'Falha na autenticacao',
        sucesso: false,
        erro: error.message,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'LOGOUT',
        tipoEvento: 'autenticacao',
        descricao: 'Usuario encerrou a sessao',
        sucesso: true,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.json({ message: 'Logout registrado com sucesso.' });
    } catch (error) {
      return next(error);
    }
  };

  salvarAdministrador = async (req, res, next) => {
    try {
      const administrador = await this.authService.salvarAdministrador(req.body, req.params.email);
      return res.status(req.params.email ? 200 : 201).json(administrador);
    } catch (error) {
      return next(error);
    }
  };

  listarAdministradores = async (req, res, next) => {
    try {
      const administradores = await this.authService.listarAdministradores();
      return res.json(administradores);
    } catch (error) {
      return next(error);
    }
  };

  excluirAdministrador = async (req, res, next) => {
    try {
      await this.authService.excluirAdministrador(req.params.email);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = AuthController;
