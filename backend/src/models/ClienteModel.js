// Modelo de referencia da entidade clientes no MySQL.
const ClienteModel = {
  tableName: 'clientes',
  fields: ['id', 'nome', 'email', 'telefone', 'documento', 'created_at', 'updated_at']
};

module.exports = ClienteModel;
