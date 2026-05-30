const AvaliacaoFilmeService = require('../services/AvaliacaoFilmeService');
const FilmeService = require('../services/FilmeService');
const LogService = require('../services/LogService');

class AvaliacaoFilmeController {
  constructor() {
    this.avaliacaoFilmeService = new AvaliacaoFilmeService();
    this.filmeService = new FilmeService();
    this.logService = new LogService();
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
      const filme = await this.filmeService.buscarPorId(req.params.id);
      const usuario = req.user.nome || req.user.email || `Usuario ${req.user.id}`;
      await this.logService.registrar({
        usuario: req.user.email || String(req.user.id),
        acao: 'AVALIACAO_FILME',
        tipoEvento: 'avaliacao',
        descricao: `${usuario} avaliou ${filme.titulo}`,
        tabela: 'avaliacoes_filmes',
        registroId: `${req.params.id}:${req.user.id}`,
        dadosInseridos: avaliacao,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(201).json(avaliacao);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = AvaliacaoFilmeController;
