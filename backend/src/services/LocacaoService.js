const LocacaoDAO = require('../dao/LocacaoDAO');

class LocacaoService {
  constructor() {
    this.locacaoDAO = new LocacaoDAO();
  }

  async listar() {
    return this.locacaoDAO.findAll();
  }

  async buscarPorId(id) {
    const locacao = await this.locacaoDAO.findById(id);

    if (!locacao) {
      const error = new Error('Locacao nao encontrada.');
      error.statusCode = 404;
      throw error;
    }

    return locacao;
  }

  async criar(dados) {
    if (!Array.isArray(dados.itens) || dados.itens.length === 0) {
      const error = new Error('Informe ao menos um filme para locacao.');
      error.statusCode = 400;
      throw error;
    }

    const dataPrevista = dados.data_devolucao_prevista || getDefaultReturnDate();

    return this.locacaoDAO.create({
      ...dados,
      data_devolucao_prevista: dataPrevista
    });
  }

  async devolver(id) {
    const locacao = await this.buscarPorId(id);

    if (locacao.status === 'devolvida') {
      return locacao;
    }

    return this.locacaoDAO.devolver(id);
  }
}

function getDefaultReturnDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

module.exports = LocacaoService;
