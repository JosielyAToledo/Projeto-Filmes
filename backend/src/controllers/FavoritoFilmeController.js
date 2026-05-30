const FavoritoFilmeService = require('../services/FavoritoFilmeService');
const FilmeService = require('../services/FilmeService');
const LogService = require('../services/LogService');

class FavoritoFilmeController {
  constructor() {
    this.favoritoFilmeService = new FavoritoFilmeService();
    this.filmeService = new FilmeService();
    this.logService = new LogService();
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
      const filme = await this.filmeService.buscarPorId(req.params.id);
      const usuario = req.user.nome || req.user.email || `Usuario ${req.user.id}`;
      await this.logService.registrar({
        usuario: req.user.email || String(req.user.id),
        acao: 'FAVORITO_FILME',
        tipoEvento: 'favorito',
        descricao: `${usuario} favoritou ${filme.titulo}`,
        tabela: 'favorito_filmes',
        registroId: `${req.params.id}:${req.user.id}`,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(201).json({ filme_id: Number(req.params.id), favorito: true });
    } catch (error) {
      return next(error);
    }
  };

  destroy = async (req, res, next) => {
    try {
      const filme = await this.filmeService.buscarPorId(req.params.id);
      await this.favoritoFilmeService.remover(req.params.id, req.user.id);
      const usuario = req.user.nome || req.user.email || `Usuario ${req.user.id}`;
      await this.logService.registrar({
        usuario: req.user.email || String(req.user.id),
        acao: 'REMOCAO_FAVORITO_FILME',
        tipoEvento: 'favorito',
        descricao: `${usuario} removeu ${filme.titulo} dos favoritos`,
        tabela: 'favorito_filmes',
        registroId: `${req.params.id}:${req.user.id}`,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = FavoritoFilmeController;
