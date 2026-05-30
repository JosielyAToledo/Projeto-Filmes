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

  async relatorioPDFPlaceholder() {
    return {
      message: 'Estrutura preparada para geracao de PDF. Sugestao futura: integrar pdfkit ou puppeteer.'
    };
  }
}

module.exports = RelatorioService;
