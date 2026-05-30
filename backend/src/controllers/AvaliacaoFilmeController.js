const AvaliacaoFilmeService = require('../services/AvaliacaoFilmeService');

class AvaliacaoFilmeController {
  constructor() {
    this.avaliacaoFilmeService = new AvaliacaoFilmeService();
  }

  index = async (req, res, next) => {
    try {
      const avaliacoes = await this.avaliacaoFilmeService.listarPorFilme(req.params.id);
      return res.json(avaliacoes);
    } catch (error) {
      return next(error);
    }
  };

  minhas = async (req, res, next) => {
    try {
      const avaliacoes = await this.avaliacaoFilmeService.listarPorUsuario(req.user.id);
      return res.json(avaliacoes);
    } catch (error) {
      return next(error);
    }
  };

  store = async (req, res, next) => {
    try {
      const avaliacao = await this.avaliacaoFilmeService.salvar(req.params.id, req.user, req.body);
      return res.status(201).json(avaliacao);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = AvaliacaoFilmeController;
