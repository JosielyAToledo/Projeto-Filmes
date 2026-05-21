const pool = require('./mysql');

const DEFAULT_ADMIN_PASSWORD_HASH = '$2a$10$DddNgW.uzbVmUkcDig4BUONe/lMRQVHLOnCclZ9SiWijCWp4m7YOa';

async function ensureDefaultAdmin() {
  await pool.execute(
    `INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       nome = VALUES(nome),
       senha_hash = VALUES(senha_hash),
       tipo_usuario = VALUES(tipo_usuario)`,
    ['Administrador', 'admin@catalogo7.com', DEFAULT_ADMIN_PASSWORD_HASH, 'admin']
  );
}

module.exports = { ensureDefaultAdmin };
