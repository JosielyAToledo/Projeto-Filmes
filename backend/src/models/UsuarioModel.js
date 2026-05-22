// Modelo de referencia da entidade usuarios no MySQL.
const UsuarioModel = {
  tableName: 'usuarios',
  fields: ['id', 'nome', 'email', 'senha_hash', 'tipo_usuario', 'status', 'foto_perfil_url', 'created_at', 'updated_at']
};

module.exports = UsuarioModel;
