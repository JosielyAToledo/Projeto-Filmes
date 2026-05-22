// Modelo de referencia da entidade filmes no MySQL.
const FilmeModel = {
  tableName: 'filmes',
  fields: [
    'id',
    'titulo',
    'titulo_original',
    'descricao',
    'ano_lancamento',
    'genero_id',
    'genero_secundario_id',
    'diretor',
    'elenco',
    'duracao',
    'classificacao',
    'pais',
    'preco_locacao',
    'estoque',
    'capa_url',
    'banner_url',
    'trailer_url',
    'status',
    'destaque',
    'criado_por',
    'created_at',
    'updated_at'
  ]
};

module.exports = FilmeModel;
