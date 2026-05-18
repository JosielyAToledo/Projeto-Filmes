const IController = require('../interfaces/IController');
const ClienteService = require('../services/ClienteService');
const LogService = require('../services/LogService');

class ClienteController extends IController {
  constructor() {
    super();
    this.clienteService = new ClienteService();
    this.logService = new LogService();
  }

  index = async (req, res, next) => {
    try {
      const clientes = await this.clienteService.listar(req.query);
      return res.json(clientes);
    } catch (error) {
      return next(error);
    }
  };

  show = async (req, res, next) => {
    try {
      const cliente = await this.clienteService.buscarPorId(req.params.id);
      return res.json(cliente);
    } catch (error) {
      return next(error);
    }
  };

  store = async (req, res, next) => {
    try {
      const cliente = await this.clienteService.criar(req.body);
      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'INCLUSAO',
        tipoEvento: 'cadastro',
        descricao: `Cliente cadastrado: ${cliente.nome}`,
        tabela: 'clientes',
        registroId: String(cliente.id),
        dadosInseridos: cliente,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(201).json(cliente);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const antes = await this.clienteService.buscarPorId(req.params.id);
      const cliente = await this.clienteService.atualizar(req.params.id, req.body);
      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'ALTERACAO',
        tipoEvento: 'cadastro',
        descricao: `Cliente alterado: ${cliente.nome}`,
        tabela: 'clientes',
        registroId: String(cliente.id),
        antes,
        depois: cliente,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.json(cliente);
    } catch (error) {
      return next(error);
    }
  };

  destroy = async (req, res, next) => {
    try {
      const cliente = await this.clienteService.buscarPorId(req.params.id);
      await this.clienteService.remover(req.params.id);
      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'EXCLUSAO',
        tipoEvento: 'cadastro',
        descricao: `Cliente excluido: ${cliente.nome}`,
        tabela: 'clientes',
        registroId: String(cliente.id),
        dadosExcluidos: cliente,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = ClienteController;
