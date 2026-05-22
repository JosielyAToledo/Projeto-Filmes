const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioDAO = require('../dao/UsuarioDAO');
const { isLocalMode } = require('../config/local_mode');

const LOCAL_ADMIN = {
  id: 1,
  nome: 'Administrador',
  email: 'admin@catalogo7.com',
  tipo_usuario: 'admin'
};
const localUsers = [];

class AuthService {
  constructor() {
    this.usuarioDAO = new UsuarioDAO();
  }

  async registrar(dados) {
    if (isLocalMode()) {
      const usuarioExistente = localUsers.find((usuario) => {
        return usuario.email.toLowerCase() === String(dados.email || '').trim().toLowerCase();
      });

      if (usuarioExistente) {
        const error = new Error('E-mail ja cadastrado.');
        error.statusCode = 409;
        throw error;
      }

      const usuario = {
        id: Date.now(),
        nome: dados.nome,
        email: dados.email,
        senha_hash: await bcrypt.hash(dados.senha, 10),
        tipo_usuario: 'usuario'
      };

      localUsers.push(usuario);

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: 'usuario'
      };
    }

    const usuarioExistente = await this.usuarioDAO.findByEmail(dados.email);

    if (usuarioExistente) {
      const error = new Error('E-mail ja cadastrado.');
      error.statusCode = 409;
      throw error;
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);
    return this.usuarioDAO.create({ ...dados, senha: senhaHash });
  }

  async login(login, senha) {
    if (isLocalMode()) {
      return this.loginLocal(login, senha);
    }

    const usuario = await this.usuarioDAO.findByLogin(login);

    if (!usuario) {
      const error = new Error('Credenciais invalidas.');
      error.statusCode = 401;
      throw error;
    }

    const tipoUsuario = usuario.tipo_usuario;
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      const error = new Error('Credenciais invalidas.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo_usuario: tipoUsuario },
      process.env.JWT_SECRET || 'troque_esta_chave_em_producao',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: tipoUsuario
      }
    };
  }

  loginLocal(login, senha) {
    const normalizedLogin = String(login || '').trim().toLowerCase();
    const isAdminLogin = normalizedLogin === 'admin' || normalizedLogin === LOCAL_ADMIN.email;

    if (isAdminLogin && senha === '123456') {
      return this.createTokenResponse(LOCAL_ADMIN);
    }

    const usuario = localUsers.find((item) => {
      return item.email.toLowerCase() === normalizedLogin
        || item.nome.toLowerCase() === normalizedLogin;
    });

    if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
      const error = new Error('Credenciais invalidas.');
      error.statusCode = 401;
      throw error;
    }

    return this.createTokenResponse(usuario);
  }

  createTokenResponse(usuario) {
    const tokenPayload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'troque_esta_chave_em_producao',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return {
      token,
      usuario: tokenPayload
    };
  }
}

module.exports = AuthService;
