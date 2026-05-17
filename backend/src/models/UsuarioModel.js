// Modelo de referencia da entidade usuarios no MySQL.
const UsuarioModel = {
  tableName: 'usuarios',
  fields: ['id', 'nome', 'email', 'senha', 'perfil', 'created_at', 'updated_at']
};

module.exports = UsuarioModel;
