const pool = require('../config/mysql');
const mongoose = require('mongoose');
const Log = require('../models/Log');

class RelatorioService {
  async resumoJSON() {
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

    return {
      filmes: filmes.total,
      usuarios: usuarios.total,
      favoritos: favoritos.total,
      clientes: clientes.total,
      locacoes: locacoes.total,
      ultimasAvaliacoes,
      filmesFavoritados,
      atividadesRecentes: await this.listarAtividadesRecentes()
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
          label: 'Locacoes por status',
          data: rows.map((row) => row.total)
        }
      ]
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
      'Relatorio Geral do Sistema - Catalogo7',
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      `Conteudo: ${getPdfScopeLabel(conteudo)}`,
      `Periodo: ${formatPdfPeriodLabel(filtros)}`,
      `Genero: ${shouldApplyPdfGenre(conteudo) ? filtros.genero || 'Todos' : 'Todos'}`
    ];

    if (shouldIncludePdfSection(conteudo, 'resumo')) {
      linhas.push(
        '',
        'Resumo',
        `Filmes cadastrados: ${resumo.filmes}`,
        `Usuarios cadastrados: ${resumo.usuarios}`,
        `Favoritos registrados: ${resumo.favoritos}`,
        `Clientes cadastrados: ${resumo.clientes}`,
        `Locacoes registradas: ${resumo.locacoes}`,
        '',
        'Usuarios por status',
        ...usuariosStatus.map((item) => `${item.status || 'sem status'}: ${item.total}`),
        '',
        'Resumo dos graficos do dashboard',
        'Filmes por genero:',
        ...filmesPorGenero.map((item) => `- ${item.genero}: ${item.total}`),
        'Locacoes por status:',
        ...locacoesStatus.map((item) => `- ${item.status || 'sem status'}: ${item.total}`)
      );
    }

    if (shouldIncludePdfSection(conteudo, 'filmes')) {
      linhas.push(
        '',
        'Filmes adicionados recentemente',
        ...filmesRecentes.map((filme) => {
        const detalhes = [filme.genero_nome, filme.ano_lancamento, filme.duracao ? `${filme.duracao} min` : '']
          .filter(Boolean)
          .join(' | ');
        return `${filme.titulo || 'Filme sem titulo'}${detalhes ? ` - ${detalhes}` : ''}`;
        }),
        '',
        'Tabela resumida de filmes',
        ...filmesResumo.map((filme) => {
          return `${filme.titulo || 'Filme'} | ${filme.genero_nome || 'Sem genero'} | ${filme.ano_lancamento || '-'} | ${filme.status || '-'}`;
        })
      );
    }

    if (shouldIncludePdfSection(conteudo, 'favoritos')) {
      linhas.push(
        '',
        'Filmes mais favoritados',
        ...filmesFavoritados.map((filme, index) => `${index + 1}. ${filme.titulo} - ${filme.total} favoritos`),
        '',
        'Ultimas avaliacoes',
        ...ultimasAvaliacoes.map((avaliacao) => {
        return `${avaliacao.usuario_nome || 'Usuario'} avaliou ${avaliacao.filme_titulo || 'Filme'} com ${avaliacao.nota || 0}/5`;
        })
      );
    }

    if (shouldIncludePdfSection(conteudo, 'atividades')) {
      const filteredActivities = filterRowsByDate(resumo.atividadesRecentes || [], filtros, 'timestamp');
      linhas.push(
        '',
        'Atividades recentes',
        ...filteredActivities.slice(0, 8).map((atividade) => {
        const data = atividade.timestamp ? new Date(atividade.timestamp).toLocaleString('pt-BR') : '-';
        return `${data} | ${atividade.usuario || 'anonimo'} | ${atividade.descricao || atividade.acao || '-'}`;
        })
      );
    }

    if (shouldIncludePdfSection(conteudo, 'usuarios')) {
      linhas.push(
        '',
        'Tabela resumida de usuarios',
        ...usuariosResumo.map((usuario) => {
          return `${usuario.nome || 'Usuario'} | ${usuario.email || '-'} | ${usuario.tipo_usuario || '-'} | ${usuario.status || '-'}`;
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
    completo: 'Relatorio completo',
    resumo: 'Resumo geral',
    filmes: 'Filmes',
    usuarios: 'Usuarios',
    favoritos: 'Favoritos e avaliacoes',
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
    clauses.push('generos.nome = ?');
    params.push(filtros.genero);
  }

  return {
    sql: clauses.join(' AND '),
    params
  };
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
  const startDate = filtros.dataInicio ? new Date(filtros.dataInicio).toLocaleDateString('pt-BR') : 'inicio';
  const endDate = filtros.dataFim ? new Date(filtros.dataFim).toLocaleDateString('pt-BR') : 'hoje';
  return `${startDate} ate ${endDate}`;
}

function escapePDFText(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[()\\]/g, '\\$&');
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
    '/F1 10 Tf',
    '14 TL',
    '0 -26 Td',
    ...lines.map((line) => `(${escapePDFText(line)}) Tj T*`),
    'T*',
    `(Pagina ${page} de ${totalPages}) Tj`,
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
