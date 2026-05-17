const pool = require('../config/mysql');

class RelatorioService {
  async resumoJSON() {
    const [[filmes]] = await pool.execute('SELECT COUNT(*) AS total FROM filmes');
    const [[clientes]] = await pool.execute('SELECT COUNT(*) AS total FROM clientes');
    const [[locacoes]] = await pool.execute('SELECT COUNT(*) AS total FROM locacoes');

    return {
      filmes: filmes.total,
      clientes: clientes.total,
      locacoes: locacoes.total
    };
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
