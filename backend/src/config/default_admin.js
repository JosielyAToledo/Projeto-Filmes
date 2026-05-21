const pool = require('./mysql');

const DEFAULT_ADMIN_PASSWORD_HASH = '$2a$10$DddNgW.uzbVmUkcDig4BUONe/lMRQVHLOnCclZ9SiWijCWp4m7YOa';

async function ensureDefaultAdmin() {
  await pool.execute(
    `INSERT INTO usuarios (nome, email, senha, perfil)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       nome = VALUES(nome),
       senha = VALUES(senha),
       perfil = VALUES(perfil)`,
    ['admin', 'admin@catalogo7.local', DEFAULT_ADMIN_PASSWORD_HASH, 'admin']
  );
}

module.exports = { ensureDefaultAdmin };
