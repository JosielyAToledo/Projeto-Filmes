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
       (titulo, descricao, ano_lancamento, genero_id, preco_locacao, estoque, capa_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        filme.titulo,
        filme.descricao || null,
        filme.ano_lancamento || null,
        filme.genero_id || null,
        filme.preco_locacao || 0,
        filme.estoque || 0,
        filme.capa_url || null
      ]
    );

    return this.findById(result.insertId);
  }

  async update(id, filme) {
    await pool.execute(
      `UPDATE filmes
       SET titulo = ?, descricao = ?, ano_lancamento = ?, genero_id = ?,
           preco_locacao = ?, estoque = ?, capa_url = ?
       WHERE id = ?`,
      [
        filme.titulo,
        filme.descricao || null,
        filme.ano_lancamento || null,
        filme.genero_id || null,
        filme.preco_locacao || 0,
        filme.estoque || 0,
        filme.capa_url || null,
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
