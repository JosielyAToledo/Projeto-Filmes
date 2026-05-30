const pool = require('../config/mysql');

class FavoritoFilmeDAO {
  async findByUser(usuarioId) {
    const [rows] = await pool.execute(
      `SELECT favorito_filmes.filme_id
       FROM favorito_filmes
       WHERE favorito_filmes.usuario_id = ?
       ORDER BY favorito_filmes.created_at DESC`,
      [usuarioId]
    );

    return rows;
  }

  async add(filmeId, usuarioId) {
    await pool.execute(
      `INSERT IGNORE INTO favorito_filmes (filme_id, usuario_id)
       VALUES (?, ?)`,
      [filmeId, usuarioId]
    );
  }

  async remove(filmeId, usuarioId) {
    await pool.execute(
      'DELETE FROM favorito_filmes WHERE filme_id = ? AND usuario_id = ?',
      [filmeId, usuarioId]
    );
  }
}

module.exports = FavoritoFilmeDAO;
