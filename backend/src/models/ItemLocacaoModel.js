// Modelo de referencia da entidade itens_locacao no MySQL.
const ItemLocacaoModel = {
  tableName: 'itens_locacao',
  fields: ['id', 'locacao_id', 'filme_id', 'quantidade', 'valor_unitario', 'created_at', 'updated_at']
};

module.exports = ItemLocacaoModel;
