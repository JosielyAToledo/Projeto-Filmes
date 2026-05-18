const IService = require('../interfaces/IService');
const ClienteDAO = require('../dao/ClienteDAO');

class ClienteService extends IService {
  constructor() {
    super();
    this.clienteDAO = new ClienteDAO();
  }

  async listar(filtros = {}) {
    return this.clienteDAO.findAll(filtros);
  }

  async buscarPorId(id) {
    const cliente = await this.clienteDAO.findById(id);

    if (!cliente) {
      const error = new Error('Cliente nao encontrado.');
      error.statusCode = 404;
      throw error;
    }

    return cliente;
  }

  async criar(dados) {
    return this.clienteDAO.create(dados);
  }

  async atualizar(id, dados) {
    await this.buscarPorId(id);
    return this.clienteDAO.update(id, dados);
  }

  async remover(id) {
    await this.buscarPorId(id);
    return this.clienteDAO.delete(id);
  }
}

module.exports = ClienteService;
