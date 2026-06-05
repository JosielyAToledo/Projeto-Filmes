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
const localAdmins = [];
let localAdminPasswordHash = null;

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
        tipo_usuario: 'usuario',
        status: 'ativo'
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

  async recuperarSenha(dados) {
    const email = String(dados.email || '').trim();

    if (isLocalMode()) {
      if (email.toLowerCase() === LOCAL_ADMIN.email) {
        localAdminPasswordHash = await bcrypt.hash(dados.senha, 10);
        return { message: 'Senha atualizada com sucesso.' };
      }

      const usuario = [...localAdmins, ...localUsers].find((item) => {
        return item.email.toLowerCase() === email.toLowerCase();
      });

      if (!usuario) {
        const error = new Error('E-mail nao encontrado.');
        error.statusCode = 404;
        throw error;
      }

      usuario.senha_hash = await bcrypt.hash(dados.senha, 10);
      return { message: 'Senha atualizada com sucesso.' };
    }

    const usuario = await this.usuarioDAO.findByEmail(email);

    if (!usuario) {
      const error = new Error('E-mail nao encontrado.');
      error.statusCode = 404;
      throw error;
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);
    await this.usuarioDAO.updatePasswordByEmail(email, senhaHash);
    return { message: 'Senha atualizada com sucesso.' };
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

    if (usuario.status === 'inativo') {
      const error = new Error('Usuario inativo.');
      error.statusCode = 403;
      throw error;
    }

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

    if (isAdminLogin && localAdminPasswordHash && bcrypt.compareSync(senha, localAdminPasswordHash)) {
      return this.createTokenResponse(LOCAL_ADMIN);
    }

    if (isAdminLogin && !localAdminPasswordHash && senha === '123456') {
      return this.createTokenResponse(LOCAL_ADMIN);
    }

    const usuario = [...localAdmins, ...localUsers].find((item) => {
      return item.email.toLowerCase() === normalizedLogin
        || item.nome.toLowerCase() === normalizedLogin;
    });

    if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
      const error = new Error('Credenciais invalidas.');
      error.statusCode = 401;
      throw error;
    }

    if (usuario.status === 'inativo') {
      const error = new Error('Usuario inativo.');
      error.statusCode = 403;
      throw error;
    }

    return this.createTokenResponse(usuario);
  }

  async salvarAdministrador(dados, emailAtual = null) {
    const status = normalizeStatus(dados.status);

    if (isLocalMode()) {
      const normalizedEmail = String(dados.email || '').trim().toLowerCase();
      const currentNormalizedEmail = String(emailAtual || dados.email || '').trim().toLowerCase();
      let admin = localAdmins.find((item) => item.email.toLowerCase() === currentNormalizedEmail);

      if (!admin && !emailAtual) {
        admin = localAdmins.find((item) => item.email.toLowerCase() === normalizedEmail);
      }

      if (!admin && !dados.senha) {
        const error = new Error('Senha obrigatoria para novo administrador.');
        error.statusCode = 400;
        throw error;
      }

      if (admin) {
        admin.nome = dados.nome;
        admin.email = dados.email;
        admin.status = status;
        if (dados.senha) {
          admin.senha_hash = await bcrypt.hash(dados.senha, 10);
        }
        return sanitizeAdmin(admin);
      }

      const novoAdmin = {
        id: Date.now(),
        nome: dados.nome,
        email: dados.email,
        senha_hash: await bcrypt.hash(dados.senha, 10),
        tipo_usuario: 'admin',
        status
      };
      localAdmins.push(novoAdmin);
      return sanitizeAdmin(novoAdmin);
    }

    const emailExistente = await this.usuarioDAO.findByEmail(dados.email);
    const isSameEmail = emailAtual && emailExistente && emailExistente.email === emailAtual;

    if (emailExistente && !isSameEmail) {
      const error = new Error('E-mail ja cadastrado.');
      error.statusCode = 409;
      throw error;
    }

    if (emailAtual) {
      const senhaHash = dados.senha ? await bcrypt.hash(dados.senha, 10) : null;
      const updated = await this.usuarioDAO.updateAdminByEmail(emailAtual, {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
        status
      });

      if (!updated) {
        const error = new Error('Administrador nao encontrado.');
        error.statusCode = 404;
        throw error;
      }

      return {
        nome: dados.nome,
        email: dados.email,
        tipo_usuario: 'admin',
        status
      };
    }

    if (!dados.senha) {
      const error = new Error('Senha obrigatoria para novo administrador.');
      error.statusCode = 400;
      throw error;
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);
    return this.usuarioDAO.createAdmin({
      nome: dados.nome,
      email: dados.email,
      senha: senhaHash,
      status
    });
  }

  async listarAdministradores() {
    if (isLocalMode()) {
      return [LOCAL_ADMIN, ...localAdmins].map(sanitizeAdmin);
    }

    return this.usuarioDAO.listAdmins();
  }

  async listarUsuarios() {
    if (isLocalMode()) {
      return [LOCAL_ADMIN, ...localAdmins, ...localUsers].map(sanitizeUser);
    }

    return this.usuarioDAO.listAll();
  }

  async atualizarStatusUsuario(id, status, usuarioLogado = {}) {
    const usuarioId = Number(id);
    const normalizedStatus = normalizeStatus(status);

    if (!usuarioId) {
      const error = new Error('Usuario invalido.');
      error.statusCode = 400;
      throw error;
    }

    if (Number(usuarioLogado.id) === usuarioId && normalizedStatus === 'inativo') {
      const error = new Error('Nao e possivel inativar o proprio usuario logado.');
      error.statusCode = 400;
      throw error;
    }

    if (isLocalMode()) {
      const usuario = [...localAdmins, ...localUsers].find((item) => Number(item.id) === usuarioId);

      if (!usuario) {
        const error = new Error('Usuario nao encontrado.');
        error.statusCode = 404;
        throw error;
      }

      usuario.status = normalizedStatus;
      return sanitizeUser(usuario);
    }

    const usuario = await this.usuarioDAO.findById(usuarioId);

    if (!usuario) {
      const error = new Error('Usuario nao encontrado.');
      error.statusCode = 404;
      throw error;
    }

    await this.usuarioDAO.updateStatusById(usuarioId, normalizedStatus);
    return sanitizeUser({
      ...usuario,
      status: normalizedStatus,
      updated_at: new Date()
    });
  }

  async excluirUsuarioInativo(id, usuarioLogado = {}) {
    const usuarioId = Number(id);

    if (!usuarioId) {
      const error = new Error('Usuario invalido.');
      error.statusCode = 400;
      throw error;
    }

    if (Number(usuarioLogado.id) === usuarioId) {
      const error = new Error('Nao e possivel excluir o proprio usuario logado.');
      error.statusCode = 400;
      throw error;
    }

    if (isLocalMode()) {
      const collections = [localAdmins, localUsers];

      for (const collection of collections) {
        const index = collection.findIndex((item) => Number(item.id) === usuarioId);

        if (index >= 0) {
          const usuario = collection[index];

          if (usuario.status !== 'inativo') {
            const error = new Error('Para excluir este usuario, primeiro inative-o.');
            error.statusCode = 400;
            throw error;
          }

          collection.splice(index, 1);
          return sanitizeUser(usuario);
        }
      }

      const error = new Error('Usuario nao encontrado.');
      error.statusCode = 404;
      throw error;
    }

    const usuario = await this.usuarioDAO.findById(usuarioId);

    if (!usuario) {
      const error = new Error('Usuario nao encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (usuario.status !== 'inativo') {
      const error = new Error('Para excluir este usuario, primeiro inative-o.');
      error.statusCode = 400;
      throw error;
    }

    const totalLocacoes = await this.usuarioDAO.countLocacoesByUsuarioId(usuarioId);

    if (totalLocacoes > 0) {
      const error = new Error('Nao e possivel excluir usuario com locacoes vinculadas.');
      error.statusCode = 409;
      throw error;
    }

    await this.usuarioDAO.deleteById(usuarioId);
    return sanitizeUser(usuario);
  }

  async excluirAdministrador(email) {
    if (isLocalMode()) {
      const index = localAdmins.findIndex((admin) => admin.email.toLowerCase() === String(email || '').toLowerCase());
      if (index >= 0) {
        localAdmins.splice(index, 1);
      }
      return;
    }

    await this.usuarioDAO.deleteAdminByEmail(email);
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

function normalizeStatus(status = 'Ativo') {
  return String(status).trim().toLowerCase() === 'inativo' ? 'inativo' : 'ativo';
}

function sanitizeAdmin(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo_usuario: 'admin',
    status: usuario.status || 'ativo'
  };
}

function sanitizeUser(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo_usuario: usuario.tipo_usuario || 'usuario',
    status: usuario.status || 'ativo',
    created_at: usuario.created_at || null,
    updated_at: usuario.updated_at || null
  };
}

module.exports = AuthService;
