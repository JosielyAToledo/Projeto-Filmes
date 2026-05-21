const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioDAO = require('../dao/UsuarioDAO');

class AuthService {
  constructor() {
    this.usuarioDAO = new UsuarioDAO();
  }

  async registrar(dados) {
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
    const usuario = await this.usuarioDAO.findByLogin(login);

    if (!usuario) {
      const error = new Error('Credenciais invalidas.');
      error.statusCode = 401;
      throw error;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      const error = new Error('Credenciais invalidas.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil || 'operador' },
      process.env.JWT_SECRET || 'troque_esta_chave_em_producao',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil || 'operador'
      }
    };
  }
}

module.exports = AuthService;
