const LocacaoService = require('../services/LocacaoService');
const LogService = require('../services/LogService');

class LocacaoController {
  constructor() {
    this.locacaoService = new LocacaoService();
    this.logService = new LogService();
  }

  index = async (req, res, next) => {
    try {
      const locacoes = await this.locacaoService.listar();
      return res.json(locacoes);
    } catch (error) {
      return next(error);
    }
  };

  show = async (req, res, next) => {
    try {
      const locacao = await this.locacaoService.buscarPorId(req.params.id);
      return res.json(locacao);
    } catch (error) {
      return next(error);
    }
  };

  store = async (req, res, next) => {
    try {
      const locacao = await this.locacaoService.criar({
        ...req.body,
        usuario_id: req.user.id
      });

      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'INCLUSAO',
        tipoEvento: 'locacao',
        descricao: `Locacao cadastrada: ${locacao.id}`,
        tabela: 'locacoes',
        registroId: String(locacao.id),
        dadosInseridos: locacao,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(201).json(locacao);
    } catch (error) {
      return next(error);
    }
  };

  devolver = async (req, res, next) => {
    try {
      const locacao = await this.locacaoService.devolver(req.params.id);
      return res.json(locacao);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = LocacaoController;
