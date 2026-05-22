const IController = require('../interfaces/IController');
const FilmeService = require('../services/FilmeService');
const LogService = require('../services/LogService');
const fs = require('fs/promises');

class FilmeController extends IController {
  constructor() {
    super();
    this.filmeService = new FilmeService();
    this.logService = new LogService();
  }

  index = async (req, res, next) => {
    try {
      const filmes = await this.filmeService.listar(req.query);
      return res.json(filmes);
    } catch (error) {
      return next(error);
    }
  };

  show = async (req, res, next) => {
    try {
      const filme = await this.filmeService.buscarPorId(req.params.id);
      return res.json(filme);
    } catch (error) {
      return next(error);
    }
  };

  store = async (req, res, next) => {
    try {
      const capaUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const filme = await this.filmeService.criar({
        ...req.body,
        capa_url: capaUrl || req.body.capa_url || null,
        criado_por: req.user.id
      });
      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'INCLUSAO',
        tipoEvento: 'cadastro',
        descricao: `Filme cadastrado: ${filme.titulo}`,
        tabela: 'filmes',
        registroId: String(filme.id),
        dadosInseridos: filme,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(201).json(filme);
    } catch (error) {
      return next(error);
    }
  };

  importarJSON = async (req, res, next) => {
    try {
      let payload = req.body;

      if (req.file) {
        const content = await fs.readFile(req.file.path, 'utf8');
        payload = JSON.parse(content);
      }

      const filmes = Array.isArray(payload) ? payload : payload.filmes;

      if (!Array.isArray(filmes)) {
        return res.status(400).json({ message: 'Envie um array de filmes ou a propriedade filmes.' });
      }

      const criados = [];

      for (const filme of filmes) {
        if (!filme.titulo) {
          return res.status(400).json({ message: 'Todos os filmes importados precisam ter titulo.' });
        }
        criados.push(await this.filmeService.criar(filme));
      }

      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'IMPORTACAO_JSON',
        tipoEvento: 'importacao',
        descricao: `${criados.length} filmes importados por JSON`,
        tabela: 'filmes',
        dadosInseridos: criados,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(201).json(criados);
    } catch (error) {
      if (error instanceof SyntaxError) {
        error.message = 'Arquivo JSON invalido.';
        error.statusCode = 400;
      }
      return next(error);
    }
  };

  exportarJSON = async (req, res, next) => {
    try {
      const filmes = await this.filmeService.listar(req.query);
      const payload = {
        exportedAt: new Date().toISOString(),
        total: filmes.length,
        filmes
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="filmes.json"');
      return res.send(JSON.stringify(payload, null, 2));
    } catch (error) {
      return next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const filmeAtual = await this.filmeService.buscarPorId(req.params.id);
      const capaUrl = req.file ? `/uploads/${req.file.filename}` : filmeAtual.capa_url;
      const filme = await this.filmeService.atualizar(req.params.id, {
        ...req.body,
        capa_url: capaUrl || req.body.capa_url || filmeAtual.capa_url
      });
      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'ALTERACAO',
        tipoEvento: 'cadastro',
        descricao: `Filme alterado: ${filme.titulo}`,
        tabela: 'filmes',
        registroId: String(filme.id),
        antes: filmeAtual,
        depois: filme,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.json(filme);
    } catch (error) {
      return next(error);
    }
  };

  destroy = async (req, res, next) => {
    try {
      const filme = await this.filmeService.buscarPorId(req.params.id);
      await this.filmeService.remover(req.params.id);
      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'EXCLUSAO',
        tipoEvento: 'cadastro',
        descricao: `Filme excluido: ${filme.titulo}`,
        tabela: 'filmes',
        registroId: String(filme.id),
        dadosExcluidos: filme,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = FilmeController;
