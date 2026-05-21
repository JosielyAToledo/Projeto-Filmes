const pool = require('../config/mysql');

class UsuarioDAO {
  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async findByLogin(login) {
    const [rows] = await pool.execute(
      `SELECT *
       FROM usuarios
       WHERE email = ?
          OR nome = ?
          OR (? = 'admin' AND email = 'admin@catalogo7.com')
       LIMIT 1`,
      [login, login, login]
    );
    return rows[0] || null;
  }

  async create(usuario) {
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario, status)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario.nome, usuario.email, usuario.senha, 'usuario', 'ativo']
    );

    return {
      id: result.insertId,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: 'usuario'
    };
  }
}

module.exports = UsuarioDAO;
