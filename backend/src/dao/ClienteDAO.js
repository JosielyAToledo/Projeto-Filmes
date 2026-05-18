const pool = require('../config/mysql');
const IDAO = require('../interfaces/IDAO');

class ClienteDAO extends IDAO {
  async findAll(filtros = {}) {
    const params = [];
    let where = '';

    if (filtros.q) {
      where = 'WHERE nome LIKE ? OR email LIKE ? OR documento LIKE ?';
      params.push(`%${filtros.q}%`, `%${filtros.q}%`, `%${filtros.q}%`);
    }

    const [rows] = await pool.execute(
      `SELECT * FROM clientes ${where} ORDER BY id DESC`,
      params
    );

    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(cliente) {
    const [result] = await pool.execute(
      'INSERT INTO clientes (nome, email, telefone, documento) VALUES (?, ?, ?, ?)',
      [
        cliente.nome,
        cliente.email || null,
        cliente.telefone || null,
        cliente.documento || null
      ]
    );

    return this.findById(result.insertId);
  }

  async update(id, cliente) {
    await pool.execute(
      'UPDATE clientes SET nome = ?, email = ?, telefone = ?, documento = ? WHERE id = ?',
      [
        cliente.nome,
        cliente.email || null,
        cliente.telefone || null,
        cliente.documento || null,
        id
      ]
    );

    return this.findById(id);
  }

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM clientes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ClienteDAO;
