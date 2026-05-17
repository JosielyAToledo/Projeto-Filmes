// Modelo de referencia da entidade filmes no MySQL.
const FilmeModel = {
  tableName: 'filmes',
  fields: ['id', 'titulo', 'descricao', 'ano_lancamento', 'genero_id', 'preco_locacao', 'estoque', 'capa_url', 'created_at', 'updated_at']
};

module.exports = FilmeModel;
