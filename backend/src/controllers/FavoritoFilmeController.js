const FavoritoFilmeService = require('../services/FavoritoFilmeService');

class FavoritoFilmeController {
  constructor() {
    this.favoritoFilmeService = new FavoritoFilmeService();
  }

  index = async (req, res, next) => {
    try {
      const favoritos = await this.favoritoFilmeService.listarPorUsuario(req.user.id);
      return res.json(favoritos);
    } catch (error) {
      return next(error);
    }
  };

  store = async (req, res, next) => {
    try {
      await this.favoritoFilmeService.adicionar(req.params.id, req.user.id);
      return res.status(201).json({ filme_id: Number(req.params.id), favorito: true });
    } catch (error) {
      return next(error);
    }
  };

  destroy = async (req, res, next) => {
    try {
      await this.favoritoFilmeService.remover(req.params.id, req.user.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = FavoritoFilmeController;
