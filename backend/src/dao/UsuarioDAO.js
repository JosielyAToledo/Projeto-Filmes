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

  async createAdmin(usuario) {
    const status = usuario.status === 'inativo' ? 'inativo' : 'ativo';
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario, status)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario.nome, usuario.email, usuario.senha, 'admin', status]
    );

    return {
      id: result.insertId,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: 'admin',
      status
    };
  }

  async updateAdminByEmail(currentEmail, usuario) {
    const fields = ['nome = ?', 'email = ?', 'status = ?', 'tipo_usuario = ?'];
    const values = [usuario.nome, usuario.email, usuario.status === 'inativo' ? 'inativo' : 'ativo', 'admin'];

    if (usuario.senha) {
      fields.push('senha_hash = ?');
      values.push(usuario.senha);
    }

    values.push(currentEmail);

    const [result] = await pool.execute(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE email = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async listAdmins() {
    const [rows] = await pool.execute(
      `SELECT id, nome, email, tipo_usuario, status, updated_at
       FROM usuarios
       WHERE tipo_usuario = 'admin'
       ORDER BY id ASC`
    );

    return rows;
  }

  async listAll() {
    const [rows] = await pool.execute(
      `SELECT id, nome, email, tipo_usuario, status, created_at, updated_at
       FROM usuarios
       ORDER BY id ASC`
    );

    return rows;
  }

  async deleteAdminByEmail(email) {
    const [result] = await pool.execute(
      `DELETE FROM usuarios
       WHERE email = ? AND tipo_usuario = 'admin'`,
      [email]
    );

    return result.affectedRows > 0;
  }
}

module.exports = UsuarioDAO;
