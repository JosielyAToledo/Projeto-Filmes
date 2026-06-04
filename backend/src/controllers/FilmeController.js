const IController = require('../interfaces/IController');
const FilmeService = require('../services/FilmeService');
const LogService = require('../services/LogService');
const CloudinaryService = require('../services/CloudinaryService');
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
      const cloudinaryUrl = await CloudinaryService.uploadImage(req.file);
      const capaUrl = cloudinaryUrl || (req.file ? `/uploads/${req.file.filename}` : null);
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

      const filmes = getImportedMovies(payload);

      if (!Array.isArray(filmes)) {
        return res.status(400).json({ message: 'Envie um filme, um array de filmes ou a propriedade filmes.' });
      }

      const criados = [];

      for (const filme of filmes) {
        const filmeNormalizado = normalizeImportedMovie(filme);
        if (!filmeNormalizado.titulo) {
          return res.status(400).json({ message: 'Todos os filmes importados precisam ter titulo.' });
        }
        criados.push(await this.filmeService.criar(filmeNormalizado));
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
      const cloudinaryUrl = await CloudinaryService.uploadImage(req.file);
      const capaUrl = cloudinaryUrl || (req.file ? `/uploads/${req.file.filename}` : filmeAtual.capa_url);
      const filme = await this.filmeService.atualizar(req.params.id, {
        ...req.body,
        capa_url: capaUrl || req.body.capa_url || filmeAtual.capa_url,
        banner_url: req.body.banner_url || filmeAtual.banner_url
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

  sincronizarTmdb = async (req, res, next) => {
    try {
      const overwrite = String(req.body?.overwrite || req.query?.overwrite || '').toLowerCase() === 'true';
      const resultado = await this.filmeService.sincronizarTmdb({ overwrite });
      await this.logService.registrar({
        usuario: req.user.email,
        acao: 'SINCRONIZACAO_TMDB',
        tipoEvento: 'integracao',
        descricao: `${resultado.atualizados} filmes atualizados com imagens da TMDB`,
        tabela: 'filmes',
        dadosInseridos: resultado,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.json(resultado);
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

const IMPORT_GENRE_IDS = {
  acao: 1,
  comedia: 2,
  drama: 3,
  'ficcao cientifica': 4,
  suspense: 5,
  romance: 6,
  terror: 7,
  animacao: 8
};

function getImportedMovies(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.filmes)) return payload.filmes;
  if (payload && typeof payload === 'object' && (payload.titulo || payload.nome || payload.filme)) {
    return [payload];
  }
  return null;
}

function normalizeImportedMovie(filme = {}) {
  const fields = normalizeImportFields(filme);
  const genreName = pickImportValue(fields, 'genero', 'genero_nome', 'categoria');
  const duration = pickImportValue(fields, 'duracao', 'duracao_minutos', 'tempo', 'minutos');
  const rating = pickImportValue(fields, 'classificacao', 'classificacao_indicativa', 'indicativa');
  const available = pickImportValue(fields, 'disponivel');

  return {
    titulo: pickImportValue(fields, 'titulo', 'nome', 'filme'),
    titulo_original: pickImportValue(fields, 'titulo_original', 'titulo_original_do_filme'),
    descricao: pickImportValue(fields, 'descricao', 'sinopse', 'resumo'),
    ano_lancamento: normalizeImportNumber(pickImportValue(fields, 'ano_lancamento', 'ano_de_lancamento', 'lancamento', 'ano')),
    genero_id: normalizeImportNumber(pickImportValue(fields, 'genero_id')) || genreIdByName(genreName),
    genero_secundario_id: normalizeImportNumber(pickImportValue(fields, 'genero_secundario_id')),
    diretor: pickImportValue(fields, 'diretor', 'direcao'),
    elenco: pickImportValue(fields, 'elenco', 'atores'),
    duracao: normalizeImportDuration(duration),
    classificacao: normalizeImportRating(rating),
    pais: pickImportValue(fields, 'pais', 'origem'),
    preco_locacao: Number(pickImportValue(fields, 'preco_locacao', 'preco')) || 9.9,
    estoque: Number(pickImportValue(fields, 'estoque', 'quantidade')) || 1,
    capa_url: pickImportValue(fields, 'capa_url', 'capa', 'imagem'),
    banner_url: pickImportValue(fields, 'banner_url', 'banner'),
    trailer_url: pickImportValue(fields, 'trailer_url', 'trailer'),
    status: normalizeImportStatus(pickImportValue(fields, 'status'), available),
    destaque: Boolean(pickImportValue(fields, 'destaque'))
  };
}

function normalizeImportFields(filme = {}) {
  return Object.entries(filme).reduce((fields, [key, value]) => {
    fields[normalizeImportKey(key)] = value;
    return fields;
  }, {});
}

function normalizeImportKey(key = '') {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function pickImportValue(fields, ...keys) {
  for (const key of keys) {
    const value = fields[normalizeImportKey(key)];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return null;
}

function normalizeImportNumber(value) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

function normalizeImportDuration(value) {
  const minutes = normalizeImportNumber(value);
  if (minutes) return `${minutes} min`;
  return value || null;
}

function normalizeImportRating(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (text.toLowerCase() === 'livre') return 'Livre';
  const number = normalizeImportNumber(text);
  return number ? String(number) : text.replace('+', '');
}

function genreIdByName(name) {
  const normalized = normalizeImportKey(name).replace(/_/g, ' ');
  return IMPORT_GENRE_IDS[normalized] || null;
}

function normalizeImportStatus(status, available) {
  const normalizedStatus = normalizeImportKey(status);
  if (['rascunho', 'publicado', 'arquivado'].includes(normalizedStatus)) {
    return normalizedStatus;
  }

  if (available === false || String(available).toLowerCase() === 'false') {
    return 'arquivado';
  }

  return 'publicado';
}

module.exports = FilmeController;
