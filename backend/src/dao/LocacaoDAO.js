const pool = require('../config/mysql');

class LocacaoDAO {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        locacoes.*,
        clientes.nome AS cliente_nome,
        usuarios.nome AS usuario_nome
      FROM locacoes
      INNER JOIN clientes ON clientes.id = locacoes.cliente_id
      INNER JOIN usuarios ON usuarios.id = locacoes.usuario_id
      ORDER BY locacoes.id DESC
    `);

    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
         locacoes.*,
         clientes.nome AS cliente_nome,
         usuarios.nome AS usuario_nome
       FROM locacoes
       INNER JOIN clientes ON clientes.id = locacoes.cliente_id
       INNER JOIN usuarios ON usuarios.id = locacoes.usuario_id
       WHERE locacoes.id = ?`,
      [id]
    );

    const locacao = rows[0] || null;
    if (!locacao) return null;

    const [itens] = await pool.execute(
      `SELECT
         itens_locacao.*,
         filmes.titulo AS filme_titulo
       FROM itens_locacao
       INNER JOIN filmes ON filmes.id = itens_locacao.filme_id
       WHERE itens_locacao.locacao_id = ?
       ORDER BY itens_locacao.id`,
      [id]
    );

    return { ...locacao, itens };
  }

  async create(dados) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const itens = await this.prepareItens(connection, dados.itens);
      const valorTotal = itens.reduce((total, item) => total + item.quantidade * item.valor_unitario, 0);

      const [result] = await connection.execute(
        `INSERT INTO locacoes
         (cliente_id, usuario_id, data_devolucao_prevista, valor_total, status)
         VALUES (?, ?, ?, ?, ?)`,
        [
          dados.cliente_id,
          dados.usuario_id,
          dados.data_devolucao_prevista,
          valorTotal,
          'aberta'
        ]
      );

      for (const item of itens) {
        await connection.execute(
          `INSERT INTO itens_locacao
           (locacao_id, filme_id, quantidade, valor_unitario)
           VALUES (?, ?, ?, ?)`,
          [result.insertId, item.filme_id, item.quantidade, item.valor_unitario]
        );

        await connection.execute(
          'UPDATE filmes SET estoque = estoque - ? WHERE id = ?',
          [item.quantidade, item.filme_id]
        );
      }

      await connection.commit();
      return this.findById(result.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async devolver(id) {
    const locacao = await this.findById(id);
    if (!locacao) return null;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        `UPDATE locacoes
         SET status = 'devolvida', data_devolucao = CURRENT_DATE
         WHERE id = ?`,
        [id]
      );

      for (const item of locacao.itens) {
        await connection.execute(
          'UPDATE filmes SET estoque = estoque + ? WHERE id = ?',
          [item.quantidade, item.filme_id]
        );
      }

      await connection.commit();
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async prepareItens(connection, itens = []) {
    const prepared = [];

    for (const item of itens) {
      const quantidade = Number(item.quantidade || 1);
      const [rows] = await connection.execute(
        'SELECT id, preco_locacao, estoque FROM filmes WHERE id = ?',
        [item.filme_id]
      );

      const filme = rows[0];
      if (!filme) {
        const error = new Error(`Filme ${item.filme_id} nao encontrado.`);
        error.statusCode = 404;
        throw error;
      }

      if (filme.estoque < quantidade) {
        const error = new Error(`Estoque insuficiente para o filme ${item.filme_id}.`);
        error.statusCode = 409;
        throw error;
      }

      prepared.push({
        filme_id: filme.id,
        quantidade,
        valor_unitario: Number(filme.preco_locacao || 0)
      });
    }

    return prepared;
  }
}

module.exports = LocacaoDAO;
