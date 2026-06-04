const pool = require('../config/mysql');
const mongoose = require('mongoose');
const Log = require('../models/Log');
const fs = require('fs');
const path = require('path');
const AuthService = require('./AuthService');
const { isLocalMode } = require('../config/local_mode');

const LOCAL_MOVIES_FILE = path.resolve(
  process.env.LOCAL_FILMES_FILE || 'backend/data/local-filmes.json'
);
const LOCAL_FAVORITES_FILE = path.resolve(
  process.env.LOCAL_FAVORITOS_FILE || 'backend/data/local-favoritos-filmes.json'
);
const LOCAL_REVIEWS_FILE = path.resolve(
  process.env.LOCAL_AVALIACOES_FILE || 'backend/data/local-avaliacoes-filmes.json'
);

class RelatorioService {
  constructor() {
    this.authService = new AuthService();
  }

  async resumoJSON(filtros = {}) {
    if (isLocalMode()) {
      return this.resumoLocalJSON(filtros);
    }

    const [[filmes]] = await pool.execute('SELECT COUNT(*) AS total FROM filmes');
    const [[usuarios]] = await pool.execute('SELECT COUNT(*) AS total FROM usuarios');
    const [[favoritos]] = await pool.execute('SELECT COUNT(*) AS total FROM favorito_filmes');
    const [[clientes]] = await pool.execute('SELECT COUNT(*) AS total FROM clientes');
    const [[locacoes]] = await pool.execute('SELECT COUNT(*) AS total FROM locacoes');
    const [ultimasAvaliacoes] = await pool.execute(`
      SELECT
        avaliacoes_filmes.nota,
        avaliacoes_filmes.comentario,
        avaliacoes_filmes.updated_at,
        usuarios.nome AS usuario_nome,
        filmes.titulo AS filme_titulo
      FROM avaliacoes_filmes
      LEFT JOIN usuarios ON usuarios.id = avaliacoes_filmes.usuario_id
      LEFT JOIN filmes ON filmes.id = avaliacoes_filmes.filme_id
      ORDER BY avaliacoes_filmes.updated_at DESC
      LIMIT 10
    `);
    const [filmesFavoritados] = await pool.execute(`
      SELECT
        filmes.id,
        filmes.titulo,
        filmes.capa_url,
        COUNT(favorito_filmes.filme_id) AS total
      FROM favorito_filmes
      INNER JOIN filmes ON filmes.id = favorito_filmes.filme_id
      GROUP BY filmes.id, filmes.titulo, filmes.capa_url
      ORDER BY total DESC, filmes.titulo ASC
      LIMIT 10
    `);
    const [filmesRecentes] = await pool.execute(`
      SELECT
        filmes.id,
        filmes.titulo,
        filmes.capa_url,
        filmes.ano_lancamento,
        filmes.duracao,
        generos.nome AS genero_nome
      FROM filmes
      LEFT JOIN generos ON generos.id = filmes.genero_id
      ORDER BY filmes.created_at DESC, filmes.id DESC
      LIMIT 8
    `);

    return {
      filmes: filmes.total,
      usuarios: usuarios.total,
      favoritos: favoritos.total,
      clientes: clientes.total,
      locacoes: locacoes.total,
      filmesRecentes,
      ultimasAvaliacoes,
      filmesFavoritados,
      atividadesRecentes: await this.listarAtividadesRecentes(),
      graficos: await this.dadosGraficosDashboard(filtros)
    };
  }

  async resumoLocalJSON(filtros = {}) {
    const filmes = loadLocalJson(LOCAL_MOVIES_FILE);
    const favoritos = loadLocalJson(LOCAL_FAVORITES_FILE);
    const avaliacoes = loadLocalJson(LOCAL_REVIEWS_FILE);
    const usuarios = await this.authService.listarUsuarios();
    const movieById = new Map(filmes.map((filme) => [Number(filme.id), filme]));
    const filmesRecentes = [...filmes]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || Number(b.id) - Number(a.id))
      .slice(0, 8);
    const ultimasAvaliacoes = avaliacoes
      .map((avaliacao) => ({
        ...avaliacao,
        usuario_nome: avaliacao.usuario_nome || 'Usuário',
        filme_titulo: movieById.get(Number(avaliacao.filme_id))?.titulo || 'Filme'
      }))
      .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
      .slice(0, 10);
    const favoritosPorFilme = countBy(favoritos, (favorito) => Number(favorito.filme_id));
    const filmesFavoritados = Array.from(favoritosPorFilme.entries())
      .map(([filmeId, total]) => {
        const filme = movieById.get(Number(filmeId)) || {};
        return {
          id: Number(filmeId),
          titulo: filme.titulo || 'Filme',
          capa_url: filme.capa_url || null,
          total
        };
      })
      .sort((a, b) => b.total - a.total || String(a.titulo).localeCompare(String(b.titulo), 'pt-BR'))
      .slice(0, 10);

    return {
      filmes: filmes.length,
      usuarios: usuarios.length,
      favoritos: favoritos.length,
      clientes: 0,
      locacoes: 0,
      filmesRecentes,
      ultimasAvaliacoes,
      filmesFavoritados,
      atividadesRecentes: await this.listarAtividadesRecentes(),
      graficos: await this.dadosGraficosDashboard(filtros)
    };
  }

  async listarAtividadesRecentes() {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }

    return Log.find({
      acao: {
        $in: [
          'INCLUSAO',
          'ALTERACAO',
          'EXCLUSAO',
          'IMPORTACAO_JSON',
          'LOGIN',
          'LOGOUT',
          'REGISTRO_USUARIO',
          'AVALIACAO_FILME',
          'FAVORITO_FILME',
          'REMOCAO_FAVORITO_FILME'
        ]
      }
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
  }

  async dadosGraficoLocacoes() {
    const [rows] = await pool.execute(`
      SELECT status, COUNT(*) AS total
      FROM locacoes
      GROUP BY status
    `);

    return {
      labels: rows.map((row) => row.status),
      datasets: [
        {
          label: 'Locações por status',
          data: rows.map((row) => row.total)
        }
      ]
    };
  }

  async dadosGraficosDashboard(filtros = {}) {
    if (isLocalMode()) {
      return this.dadosGraficosDashboardLocal(filtros);
    }

    const watchedDateFilter = buildChartDateFilter(filtros.watchedPeriod, 'favorito_filmes.created_at');
    const genreDateFilter = buildChartDateFilter(filtros.genrePeriod, 'filmes.created_at');
    const userDateFilter = buildChartDateFilter(filtros.usersPeriod, 'usuarios.created_at');
    const commentsDateFilter = buildChartDateFilter(filtros.commentsPeriod, 'avaliacoes_filmes.updated_at');
    const genreNameFilter = buildChartGenreFilter(filtros.genero);
    const genreWhere = [genreDateFilter.sql, genreNameFilter.sql].filter(Boolean).join(' AND ');

    const [filmesMaisFavoritados] = await pool.execute(`
      SELECT
        filmes.id,
        filmes.titulo,
        COUNT(favorito_filmes.id) AS total
      FROM favorito_filmes
      INNER JOIN filmes ON filmes.id = favorito_filmes.filme_id
      ${watchedDateFilter.sql ? `WHERE ${watchedDateFilter.sql}` : ''}
      GROUP BY filmes.id, filmes.titulo
      ORDER BY total DESC, filmes.titulo ASC
      LIMIT 10
    `, watchedDateFilter.params);

    const [filmesPorGenero] = await pool.execute(`
      SELECT COALESCE(generos.nome, 'Sem gênero') AS genero, COUNT(filmes.id) AS total
      FROM filmes
      LEFT JOIN generos ON generos.id = filmes.genero_id
      ${genreWhere ? `WHERE ${genreWhere}` : ''}
      GROUP BY generos.nome
      ORDER BY total DESC, genero ASC
      LIMIT 7
    `, [...genreDateFilter.params, ...genreNameFilter.params]);

    const [usuariosPorStatus] = await pool.execute(`
      SELECT COALESCE(status, 'sem status') AS status, COUNT(*) AS total
      FROM usuarios
      ${userDateFilter.sql ? `WHERE ${userDateFilter.sql}` : ''}
      GROUP BY status
      ORDER BY total DESC, status ASC
    `, userDateFilter.params);

    const [filmesMaisComentados] = await pool.execute(`
      SELECT
        filmes.id,
        filmes.titulo,
        COUNT(avaliacoes_filmes.id) AS total
      FROM avaliacoes_filmes
      INNER JOIN filmes ON filmes.id = avaliacoes_filmes.filme_id
      WHERE avaliacoes_filmes.comentario IS NOT NULL
        AND TRIM(avaliacoes_filmes.comentario) <> ''
        ${commentsDateFilter.sql ? `AND ${commentsDateFilter.sql}` : ''}
      GROUP BY filmes.id, filmes.titulo
      ORDER BY total DESC, filmes.titulo ASC
      LIMIT 10
    `, commentsDateFilter.params);

    return {
      filmesMaisFavoritados,
      filmesPorGenero,
      usuariosPorStatus,
      filmesMaisComentados
    };
  }

  async dadosGraficosDashboardLocal(filtros = {}) {
    const filmes = loadLocalJson(LOCAL_MOVIES_FILE);
    const favoritos = loadLocalJson(LOCAL_FAVORITES_FILE);
    const avaliacoes = loadLocalJson(LOCAL_REVIEWS_FILE);
    const usuarios = await this.authService.listarUsuarios();
    const movieById = new Map(filmes.map((filme) => [Number(filme.id), filme]));
    const genreStart = getChartStartDate(filtros.genrePeriod);
    const userStart = getChartStartDate(filtros.usersPeriod);
    const commentsStart = getChartStartDate(filtros.commentsPeriod);
    const favoritesStart = getChartStartDate(filtros.watchedPeriod);
    const selectedGenre = normalizeText(filtros.genero);
    const filteredGenreMovies = filmes.filter((filme) => {
      const matchesDate = isDateAfterStart(filme.created_at, genreStart);
      const matchesGenre = !selectedGenre || selectedGenre === normalizeText('Todos os gêneros')
        || normalizeText(filme.genero_nome) === selectedGenre;
      return matchesDate && matchesGenre;
    });
    const filmesPorGenero = Array.from(countBy(filteredGenreMovies, (filme) => filme.genero_nome || 'Sem gênero').entries())
      .map(([genero, total]) => ({ genero, total }))
      .sort((a, b) => b.total - a.total || String(a.genero).localeCompare(String(b.genero), 'pt-BR'))
      .slice(0, 7);
    const usuariosPorStatus = Array.from(countBy(
      usuarios.filter((usuario) => isDateAfterStart(usuario.created_at, userStart)),
      (usuario) => usuario.status || 'ativo'
    ).entries())
      .map(([status, total]) => ({ status, total }))
      .sort((a, b) => b.total - a.total || String(a.status).localeCompare(String(b.status), 'pt-BR'));
    const comentariosPorFilme = countBy(
      avaliacoes.filter((avaliacao) => {
        return String(avaliacao.comentario || '').trim()
          && isDateAfterStart(avaliacao.updated_at || avaliacao.created_at, commentsStart);
      }),
      (avaliacao) => Number(avaliacao.filme_id)
    );
    const filmesMaisComentados = Array.from(comentariosPorFilme.entries())
      .map(([filmeId, total]) => ({
        id: Number(filmeId),
        titulo: movieById.get(Number(filmeId))?.titulo || 'Filme',
        total
      }))
      .sort((a, b) => b.total - a.total || String(a.titulo).localeCompare(String(b.titulo), 'pt-BR'))
      .slice(0, 10);
    const favoritosPorFilme = countBy(
      favoritos.filter((favorito) => isDateAfterStart(favorito.created_at, favoritesStart)),
      (favorito) => Number(favorito.filme_id)
    );
    const filmesMaisFavoritados = Array.from(favoritosPorFilme.entries())
      .map(([filmeId, total]) => ({
        id: Number(filmeId),
        titulo: movieById.get(Number(filmeId))?.titulo || 'Filme',
        total
      }))
      .sort((a, b) => b.total - a.total || String(a.titulo).localeCompare(String(b.titulo), 'pt-BR'))
      .slice(0, 10);

    return {
      filmesMaisFavoritados,
      filmesPorGenero,
      usuariosPorStatus,
      filmesMaisComentados
    };
  }

  async relatorioPDF(filtros = {}) {
    const conteudo = normalizePdfScope(filtros.conteudo);
    const movieFilters = shouldApplyPdfGenre(conteudo) ? filtros : { ...filtros, genero: '' };
    const dateFilter = buildPdfDateFilter(filtros);
    const movieDateFilter = buildMoviePdfFilter(movieFilters, 'filmes.created_at');
    const userDateFilter = buildPdfDateFilter(filtros, 'usuarios.created_at');
    const favoriteDateFilter = buildMoviePdfFilter(movieFilters, 'favorito_filmes.created_at');
    const reviewDateFilter = buildMoviePdfFilter(movieFilters, 'avaliacoes_filmes.updated_at');
    const filmesLimit = conteudo === 'filmes' ? '' : 'LIMIT 12';
    const filmesRecentesLimit = conteudo === 'filmes' ? '' : 'LIMIT 8';
    const usuariosLimit = conteudo === 'usuarios' ? '' : 'LIMIT 12';
    const resumo = await this.resumoJSON();
    const [usuariosStatus] = await pool.execute(`
      SELECT status, COUNT(*) AS total
      FROM usuarios
      GROUP BY status
    `);
    const [filmesRecentes] = await pool.execute(`
      SELECT
        filmes.titulo,
        generos.nome AS genero_nome,
        filmes.ano_lancamento,
        filmes.duracao,
        filmes.created_at
      FROM filmes
      LEFT JOIN generos ON generos.id = filmes.genero_id
      ${movieDateFilter.sql ? `WHERE ${movieDateFilter.sql}` : ''}
      ORDER BY filmes.created_at DESC, filmes.id DESC
      ${filmesRecentesLimit}
    `, movieDateFilter.params);
    const [filmesPorGenero] = await pool.execute(`
      SELECT COALESCE(generos.nome, 'Sem gênero') AS genero, COUNT(*) AS total
      FROM filmes
      LEFT JOIN generos ON generos.id = filmes.genero_id
      GROUP BY generos.nome
      ORDER BY total DESC, genero ASC
      LIMIT 8
    `);
    const [locacoesStatus] = await pool.execute(`
      SELECT status, COUNT(*) AS total
      FROM locacoes
      GROUP BY status
      ORDER BY total DESC
    `);
    const [filmesResumo] = await pool.execute(`
      SELECT
        filmes.titulo,
        generos.nome AS genero_nome,
        filmes.ano_lancamento,
        filmes.status
      FROM filmes
      LEFT JOIN generos ON generos.id = filmes.genero_id
      ${movieDateFilter.sql ? `WHERE ${movieDateFilter.sql}` : ''}
      ORDER BY filmes.created_at DESC, filmes.id DESC
      ${filmesLimit}
    `, movieDateFilter.params);
    const [usuariosResumo] = await pool.execute(`
      SELECT nome, email, tipo_usuario, status, created_at
      FROM usuarios
      ${userDateFilter.sql ? `WHERE ${userDateFilter.sql}` : ''}
      ORDER BY created_at DESC, id DESC
      ${usuariosLimit}
    `, userDateFilter.params);
    const [filmesFavoritados] = await pool.execute(`
      SELECT
        filmes.titulo,
        COUNT(favorito_filmes.filme_id) AS total,
        MAX(favorito_filmes.created_at) AS updated_at
      FROM favorito_filmes
      INNER JOIN filmes ON filmes.id = favorito_filmes.filme_id
      LEFT JOIN generos ON generos.id = filmes.genero_id
      ${favoriteDateFilter.sql ? `WHERE ${favoriteDateFilter.sql}` : ''}
      GROUP BY filmes.id, filmes.titulo
      ORDER BY total DESC, filmes.titulo ASC
      ${conteudo === 'favoritos' ? '' : 'LIMIT 8'}
    `, favoriteDateFilter.params);
    const [ultimasAvaliacoes] = await pool.execute(`
      SELECT
        avaliacoes_filmes.nota,
        avaliacoes_filmes.comentario,
        avaliacoes_filmes.updated_at,
        usuarios.nome AS usuario_nome,
        filmes.titulo AS filme_titulo
      FROM avaliacoes_filmes
      LEFT JOIN usuarios ON usuarios.id = avaliacoes_filmes.usuario_id
      LEFT JOIN filmes ON filmes.id = avaliacoes_filmes.filme_id
      LEFT JOIN generos ON generos.id = filmes.genero_id
      ${reviewDateFilter.sql ? `WHERE ${reviewDateFilter.sql}` : ''}
      ORDER BY avaliacoes_filmes.updated_at DESC
      ${conteudo === 'favoritos' ? '' : 'LIMIT 8'}
    `, reviewDateFilter.params);

    const linhas = [
      'Relatório Geral do Sistema - Catálogo7',
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      `Gerado por: ${filtros.usuario || 'Administrador'}`,
      `Conteúdo: ${getPdfScopeLabel(conteudo)}`,
      `Período: ${formatPdfPeriodLabel(filtros)}`,
      `Gênero: ${shouldApplyPdfGenre(conteudo) ? filtros.genero || 'Todos' : 'Todos'}`,
      '',
      '================================================================',
      'RESUMO E ESTATÍSTICAS',
      '================================================================'
    ];

    if (shouldIncludePdfSection(conteudo, 'resumo')) {
      linhas.push(
        'Indicador                                Total',
        '---------------------------------------------------------------',
        pdfTableRow('Filmes cadastrados', resumo.filmes),
        pdfTableRow('Usuários cadastrados', resumo.usuarios),
        pdfTableRow('Favoritos registrados', resumo.favoritos),
        pdfTableRow('Clientes cadastrados', resumo.clientes),
        pdfTableRow('Locações registradas', resumo.locacoes),
        '',
        'Usuários por status',
        '---------------------------------------------------------------',
        ...usuariosStatus.map((item) => `${item.status || 'sem status'}: ${item.total}`),
        '',
        'Resumo dos gráficos do dashboard',
        'Filmes por gênero:',
        ...filmesPorGenero.map((item) => `- ${item.genero}: ${item.total}`),
        'Locações por status:',
        ...locacoesStatus.map((item) => `- ${item.status || 'sem status'}: ${item.total}`)
      );
    }

    if (shouldIncludePdfSection(conteudo, 'filmes')) {
      linhas.push(
        '',
        'Filmes adicionados recentemente',
        'Título                         Gênero              Ano   Duração',
        '---------------------------------------------------------------',
        ...filmesRecentes.map((filme) => {
        const detalhes = [filme.genero_nome, filme.ano_lancamento, filme.duracao ? `${filme.duracao} min` : '']
          .filter(Boolean)
          .join(' | ');
        return `${filme.titulo || 'Filme sem título'}${detalhes ? ` - ${detalhes}` : ''}`;
        }),
        '',
        'Tabela resumida de filmes',
        'Título                         Gênero              Ano   Status',
        '---------------------------------------------------------------',
        ...filmesResumo.map((filme) => {
          return `${filme.titulo || 'Filme'} | ${filme.genero_nome || 'Sem gênero'} | ${filme.ano_lancamento || '-'} | ${filme.status || '-'}`;
        })
      );
    }

    if (shouldIncludePdfSection(conteudo, 'favoritos')) {
      linhas.push(
        '',
        'Filmes mais favoritados',
        'Posição  Filme                                      Total',
        '---------------------------------------------------------------',
        ...filmesFavoritados.map((filme, index) => `${index + 1}. ${filme.titulo} - ${filme.total} favoritos`),
        '',
        'Últimas avaliações',
        'Usuário                    Filme                    Nota',
        '---------------------------------------------------------------',
        ...ultimasAvaliacoes.map((avaliacao) => {
        return `${avaliacao.usuario_nome || 'Usuário'} avaliou ${avaliacao.filme_titulo || 'Filme'} com ${avaliacao.nota || 0}/5`;
        })
      );
    }

    if (shouldIncludePdfSection(conteudo, 'atividades')) {
      const filteredActivities = filterRowsByDate(resumo.atividadesRecentes || [], filtros, 'timestamp');
      linhas.push(
        '',
        'Atividades recentes',
        'Data/Hora                  Usuário                  Descrição',
        '---------------------------------------------------------------',
        ...filteredActivities.slice(0, 8).map((atividade) => {
        const data = atividade.timestamp ? new Date(atividade.timestamp).toLocaleString('pt-BR') : '-';
        return `${data} | ${atividade.usuario || 'anônimo'} | ${atividade.descricao || atividade.acao || '-'}`;
        })
      );
    }

    if (shouldIncludePdfSection(conteudo, 'usuarios')) {
      linhas.push(
        '',
        'Tabela resumida de usuários',
        'Nome                       E-mail                   Status',
        '---------------------------------------------------------------',
        ...usuariosResumo.map((usuario) => {
          return `${usuario.nome || 'Usuário'} | ${usuario.email || '-'} | ${usuario.tipo_usuario || '-'} | ${usuario.status || '-'}`;
        })
      );
    }

    return makeSimplePDF(linhas);
  }
}

function normalizePdfScope(value) {
  const scope = String(value || 'completo').toLowerCase();
  return ['completo', 'resumo', 'filmes', 'usuarios', 'favoritos', 'atividades'].includes(scope)
    ? scope
    : 'completo';
}

function shouldIncludePdfSection(scope, section) {
  if (scope === 'completo') return true;
  return scope === section;
}

function shouldApplyPdfGenre(scope) {
  return ['filmes', 'favoritos'].includes(scope);
}

function getPdfScopeLabel(scope) {
  const labels = {
    completo: 'Relatório completo',
    resumo: 'Resumo geral',
    filmes: 'Filmes',
    usuarios: 'Usuários',
    favoritos: 'Favoritos e avaliações',
    atividades: 'Atividades recentes'
  };
  return labels[scope] || labels.completo;
}

function buildPdfDateFilter(filtros = {}, column = 'created_at') {
  const params = [];
  const clauses = [];

  if (filtros.dataInicio) {
    clauses.push(`${column} >= ?`);
    params.push(new Date(filtros.dataInicio));
  }

  if (filtros.dataFim) {
    clauses.push(`${column} <= ?`);
    params.push(new Date(filtros.dataFim));
  }

  return {
    sql: clauses.join(' AND '),
    params
  };
}

function buildMoviePdfFilter(filtros = {}, dateColumn = 'filmes.created_at') {
  const dateFilter = buildPdfDateFilter(filtros, dateColumn);
  const clauses = dateFilter.sql ? [dateFilter.sql] : [];
  const params = [...dateFilter.params];

  if (filtros.genero) {
    clauses.push(`${normalizedSqlText('generos.nome')} = ?`);
    params.push(normalizeText(filtros.genero));
  }

  return {
    sql: clauses.join(' AND '),
    params
  };
}

function buildChartDateFilter(period, column) {
  const startDate = getChartStartDate(period);

  if (!startDate) {
    return { sql: '', params: [] };
  }

  return {
    sql: `${column} >= ?`,
    params: [startDate]
  };
}

function buildChartGenreFilter(genero) {
  const value = String(genero || '').trim();

  if (!value || normalizeText(value) === normalizeText('Todos os gêneros')) {
    return { sql: '', params: [] };
  }

  return {
    sql: `${normalizedSqlText('generos.nome')} = ?`,
    params: [normalizeText(value)]
  };
}

function normalizedSqlText(column) {
  return [
    ['Á', 'a'], ['À', 'a'], ['Â', 'a'], ['Ã', 'a'], ['Ä', 'a'],
    ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ã', 'a'], ['ä', 'a'],
    ['É', 'e'], ['È', 'e'], ['Ê', 'e'], ['Ë', 'e'],
    ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'],
    ['Í', 'i'], ['Ì', 'i'], ['Î', 'i'], ['Ï', 'i'],
    ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'],
    ['Ó', 'o'], ['Ò', 'o'], ['Ô', 'o'], ['Õ', 'o'], ['Ö', 'o'],
    ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['õ', 'o'], ['ö', 'o'],
    ['Ú', 'u'], ['Ù', 'u'], ['Û', 'u'], ['Ü', 'u'],
    ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'],
    ['Ç', 'c'], ['ç', 'c']
  ].reduce((expression, [from, to]) => `REPLACE(${expression}, '${from}', '${to}')`, `LOWER(${column})`);
}

function getChartStartDate(period) {
  const normalized = normalizeText(period || '');
  const now = new Date();

  if (!normalized || normalized.includes('todos')) return null;

  if (normalized.includes('7')) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  }

  if (normalized.includes('30')) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  }

  if (normalized.includes('mes')) {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (normalized.includes('ano')) {
    return new Date(now.getFullYear(), 0, 1);
  }

  return null;
}

function isDateAfterStart(value, startDate) {
  if (!startDate) return true;
  if (!value) return true;

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= startDate;
}

function loadLocalJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Não foi possível carregar dados locais para relatório.', error.message);
    return [];
  }
}

function countBy(items = [], getKey) {
  return items.reduce((map, item) => {
    const key = getKey(item);
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());
}

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function filterRowsByDate(rows = [], filtros = {}, field = 'updated_at') {
  const startDate = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
  const endDate = filtros.dataFim ? new Date(filtros.dataFim) : null;

  return rows.filter((row) => {
    const rawDate = row[field] || row.created_at || row.updated_at;
    if (!rawDate) return true;

    const date = new Date(rawDate);
    const matchesStart = !startDate || date >= startDate;
    const matchesEnd = !endDate || date <= endDate;
    return matchesStart && matchesEnd;
  });
}

function formatPdfPeriodLabel(filtros = {}) {
  const startDate = filtros.dataInicio ? new Date(filtros.dataInicio).toLocaleDateString('pt-BR') : 'início';
  const endDate = filtros.dataFim ? new Date(filtros.dataFim).toLocaleDateString('pt-BR') : 'hoje';
  return `${startDate} até ${endDate}`;
}

function escapePDFText(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[()\\]/g, '\\$&');
}

function pdfTableRow(label, value) {
  return `${String(label).padEnd(40, ' ')} ${String(value ?? 0).padStart(8, ' ')}`;
}

function makeSimplePDF(lines) {
  const pageChunks = chunkLines(lines, 42);
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    `2 0 obj\n<< /Type /Pages /Kids [${pageChunks.map((_, index) => `${3 + index} 0 R`).join(' ')}] /Count ${pageChunks.length} >>\nendobj\n`
  ];
  const fontObjectId = 3 + pageChunks.length;
  const firstContentObjectId = fontObjectId + 1;

  pageChunks.forEach((_, index) => {
    const pageObjectId = 3 + index;
    const contentObjectId = firstContentObjectId + index;
    objects.push(`${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>\nendobj\n`);
  });

  objects.push(`${fontObjectId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  pageChunks.forEach((chunk, index) => {
    const content = buildPdfPageContent(chunk, index + 1, pageChunks.length);
    objects.push(`${firstContentObjectId + index} 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream\nendobj\n`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += object;
  });

  const xref = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return pdf;
}

function buildPdfPageContent(lines, page, totalPages) {
  return [
    'BT',
    '/F1 18 Tf',
    '50 790 Td',
    '(Relatorio Geral Catalogo7) Tj',
    '/F1 9 Tf',
    '360 790 Td',
    `(${escapePDFText(new Date().toLocaleString('pt-BR'))}) Tj`,
    '/F1 10 Tf',
    '14 TL',
    '-360 -26 Td',
    ...lines.map((line) => `(${escapePDFText(line)}) Tj T*`),
    'T*',
    '0 -12 Td',
    `(Catalogo7 - Pagina ${page} de ${totalPages}) Tj`,
    'ET'
  ].join('\n');
}

function chunkLines(lines, size) {
  const chunks = [];
  for (let index = 0; index < lines.length; index += size) {
    chunks.push(lines.slice(index, index + size));
  }
  return chunks.length ? chunks : [[]];
}

module.exports = RelatorioService;
