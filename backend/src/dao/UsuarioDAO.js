const pool = require('../config/mysql');

class UsuarioDAO {
  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async create(usuario) {
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [usuario.nome, usuario.email, usuario.senha]
    );

    return { id: result.insertId, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil || 'operador' };
  }
}

module.exports = UsuarioDAO;
