// Modelo de referencia da entidade locacoes no MySQL.
const LocacaoModel = {
  tableName: 'locacoes',
  fields: ['id', 'cliente_id', 'usuario_id', 'data_locacao', 'data_devolucao_prevista', 'data_devolucao', 'valor_total', 'status', 'created_at', 'updated_at']
};

module.exports = LocacaoModel;
