const pool = require('../config/mysql');
const IDAO = require('../interfaces/IDAO');

class FilmeDAO extends IDAO {
  async findAll(filtros = {}) {
    const params = [];
    let where = '';

    if (filtros.q) {
      where = 'WHERE filmes.titulo LIKE ? OR generos.nome LIKE ?';
      params.push(`%${filtros.q}%`, `%${filtros.q}%`);
    }

    const [rows] = await pool.execute(`
      SELECT filmes.*, generos.nome AS genero_nome
      FROM filmes
      LEFT JOIN generos ON generos.id = filmes.genero_id
      ${where}
      ORDER BY filmes.id DESC
    `, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT filmes.*, generos.nome AS genero_nome
       FROM filmes
       LEFT JOIN generos ON generos.id = filmes.genero_id
       WHERE filmes.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async create(filme) {
    const [result] = await pool.execute(
      `INSERT INTO filmes
       (titulo, titulo_original, descricao, ano_lancamento, genero_id, genero_secundario_id,
        diretor, elenco, duracao, classificacao, pais, preco_locacao, estoque, capa_url,
        banner_url, trailer_url, status, destaque, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        filme.titulo,
        filme.titulo_original || null,
        filme.descricao || null,
        filme.ano_lancamento || null,
        filme.genero_id || null,
        filme.genero_secundario_id || null,
        filme.diretor || null,
        filme.elenco || null,
        filme.duracao || null,
        filme.classificacao || null,
        filme.pais || null,
        filme.preco_locacao || 0,
        filme.estoque || 0,
        filme.capa_url || null,
        filme.banner_url || null,
        filme.trailer_url || null,
        filme.status || 'publicado',
        Boolean(filme.destaque),
        filme.criado_por || null
      ]
    );

    return this.findById(result.insertId);
  }

  async update(id, filme) {
    await pool.execute(
      `UPDATE filmes
       SET titulo = ?, titulo_original = ?, descricao = ?, ano_lancamento = ?, genero_id = ?,
           genero_secundario_id = ?, diretor = ?, elenco = ?, duracao = ?, classificacao = ?,
           pais = ?, preco_locacao = ?, estoque = ?, capa_url = ?, banner_url = ?,
           trailer_url = ?, status = ?, destaque = ?
       WHERE id = ?`,
      [
        filme.titulo,
        filme.titulo_original || null,
        filme.descricao || null,
        filme.ano_lancamento || null,
        filme.genero_id || null,
        filme.genero_secundario_id || null,
        filme.diretor || null,
        filme.elenco || null,
        filme.duracao || null,
        filme.classificacao || null,
        filme.pais || null,
        filme.preco_locacao || 0,
        filme.estoque || 0,
        filme.capa_url || null,
        filme.banner_url || null,
        filme.trailer_url || null,
        filme.status || 'publicado',
        Boolean(filme.destaque),
        id
      ]
    );

    return this.findById(id);
  }

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM filmes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = FilmeDAO;
