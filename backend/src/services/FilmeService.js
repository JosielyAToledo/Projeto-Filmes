const IService = require('../interfaces/IService');
const FilmeDAO = require('../dao/FilmeDAO');

class FilmeService extends IService {
  constructor() {
    super();
    this.filmeDAO = new FilmeDAO();
  }

  async listar(filtros = {}) {
    return this.filmeDAO.findAll(filtros);
  }

  async buscarPorId(id) {
    const filme = await this.filmeDAO.findById(id);

    if (!filme) {
      const error = new Error('Filme nao encontrado.');
      error.statusCode = 404;
      throw error;
    }

    return filme;
  }

  async criar(dados) {
    return this.filmeDAO.create(dados);
  }

  async atualizar(id, dados) {
    await this.buscarPorId(id);
    return this.filmeDAO.update(id, dados);
  }

  async remover(id) {
    await this.buscarPorId(id);
    return this.filmeDAO.delete(id);
  }
}

module.exports = FilmeService;
