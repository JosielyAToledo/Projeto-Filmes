const pool = require('../config/mysql');

class AvaliacaoFilmeDAO {
  async findByMovie(filmeId) {
    const [rows] = await pool.execute(
      `SELECT avaliacoes_filmes.*, usuarios.nome AS usuario_nome
       FROM avaliacoes_filmes
       LEFT JOIN usuarios ON usuarios.id = avaliacoes_filmes.usuario_id
       WHERE avaliacoes_filmes.filme_id = ?
       ORDER BY avaliacoes_filmes.created_at DESC`,
      [filmeId]
    );

    return rows;
  }

  async upsert(avaliacao) {
    await pool.execute(
      `INSERT INTO avaliacoes_filmes (filme_id, usuario_id, nota, comentario)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nota = VALUES(nota),
         comentario = VALUES(comentario),
         updated_at = CURRENT_TIMESTAMP`,
      [
        avaliacao.filme_id,
        avaliacao.usuario_id,
        avaliacao.nota,
        avaliacao.comentario || null
      ]
    );

    const [rows] = await pool.execute(
      `SELECT avaliacoes_filmes.*, usuarios.nome AS usuario_nome
       FROM avaliacoes_filmes
       LEFT JOIN usuarios ON usuarios.id = avaliacoes_filmes.usuario_id
       WHERE avaliacoes_filmes.filme_id = ? AND avaliacoes_filmes.usuario_id = ?`,
      [avaliacao.filme_id, avaliacao.usuario_id]
    );

    return rows[0] || null;
  }
}

module.exports = AvaliacaoFilmeDAO;
