require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');

const REQUIRED_ENV = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const shouldSeed = process.argv.includes('--seed');

async function main() {
  validateEnv();

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    await runSqlFile(connection, 'database/schema.sql');
    await ensureCompatibility(connection);

    if (shouldSeed) {
      await runSqlFile(connection, 'database/seed.sql');
    }

    console.log(`MySQL migration concluida em ${process.env.DB_NAME}.`);
  } finally {
    await connection.end();
  }
}

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Variaveis obrigatorias ausentes: ${missing.join(', ')}`);
  }
}

async function runSqlFile(connection, relativePath) {
  const sqlPath = path.resolve(__dirname, '..', relativePath);
  const sql = await fs.readFile(sqlPath, 'utf8');
  await connection.query(sql);
}

async function ensureCompatibility(connection) {
  await ensureUsuarios(connection);
  await ensureFilmes(connection);
}

async function ensureUsuarios(connection) {
  if (!(await tableExists(connection, 'usuarios'))) return;

  if (!(await columnExists(connection, 'usuarios', 'senha_hash'))) {
    if (await columnExists(connection, 'usuarios', 'senha')) {
      await connection.query('ALTER TABLE usuarios ADD COLUMN senha_hash VARCHAR(255) NULL AFTER email');
      await connection.query('UPDATE usuarios SET senha_hash = senha WHERE senha_hash IS NULL');
      await connection.query('ALTER TABLE usuarios MODIFY senha_hash VARCHAR(255) NOT NULL');
    } else {
      await connection.query('ALTER TABLE usuarios ADD COLUMN senha_hash VARCHAR(255) NOT NULL AFTER email');
    }
  }

  if (!(await columnExists(connection, 'usuarios', 'tipo_usuario'))) {
    await connection.query("ALTER TABLE usuarios ADD COLUMN tipo_usuario ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario' AFTER senha_hash");

    if (await columnExists(connection, 'usuarios', 'perfil')) {
      await connection.query("UPDATE usuarios SET tipo_usuario = CASE WHEN perfil = 'admin' THEN 'admin' ELSE 'usuario' END");
    }
  }

  if (!(await columnExists(connection, 'usuarios', 'status'))) {
    await connection.query("ALTER TABLE usuarios ADD COLUMN status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo' AFTER tipo_usuario");
  }

  if (!(await columnExists(connection, 'usuarios', 'foto_perfil_url'))) {
    await connection.query('ALTER TABLE usuarios ADD COLUMN foto_perfil_url VARCHAR(255) NULL AFTER status');
  }
}

async function ensureFilmes(connection) {
  if (!(await tableExists(connection, 'filmes'))) return;

  await addColumnIfMissing(connection, 'filmes', 'titulo_original', 'VARCHAR(180) NULL AFTER titulo');
  await addColumnIfMissing(connection, 'filmes', 'descricao', 'TEXT NULL AFTER titulo_original');
  await addColumnIfMissing(connection, 'filmes', 'ano_lancamento', 'INT NULL AFTER descricao');
  await addColumnIfMissing(connection, 'filmes', 'genero_id', 'INT NULL AFTER ano_lancamento');
  await addColumnIfMissing(connection, 'filmes', 'genero_secundario_id', 'INT NULL AFTER genero_id');
  await addColumnIfMissing(connection, 'filmes', 'diretor', 'VARCHAR(140) NULL AFTER genero_secundario_id');
  await addColumnIfMissing(connection, 'filmes', 'elenco', 'TEXT NULL AFTER diretor');
  await addColumnIfMissing(connection, 'filmes', 'duracao', 'VARCHAR(40) NULL AFTER elenco');
  await addColumnIfMissing(connection, 'filmes', 'classificacao', 'VARCHAR(30) NULL AFTER duracao');
  await addColumnIfMissing(connection, 'filmes', 'pais', 'VARCHAR(80) NULL AFTER classificacao');
  await addColumnIfMissing(connection, 'filmes', 'preco_locacao', 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER pais');
  await addColumnIfMissing(connection, 'filmes', 'estoque', 'INT NOT NULL DEFAULT 0 AFTER preco_locacao');
  await addColumnIfMissing(connection, 'filmes', 'capa_url', 'VARCHAR(255) NULL AFTER estoque');
  await addColumnIfMissing(connection, 'filmes', 'banner_url', 'VARCHAR(255) NULL AFTER capa_url');
  await addColumnIfMissing(connection, 'filmes', 'trailer_url', 'VARCHAR(255) NULL AFTER banner_url');
  await addColumnIfMissing(connection, 'filmes', 'status', "ENUM('rascunho', 'publicado', 'arquivado') NOT NULL DEFAULT 'publicado' AFTER trailer_url");
  await addColumnIfMissing(connection, 'filmes', 'destaque', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER status');
  await addColumnIfMissing(connection, 'filmes', 'criado_por', 'INT NULL AFTER destaque');

  if (await columnExists(connection, 'filmes', 'ano')) {
    await connection.query('UPDATE filmes SET ano_lancamento = ano WHERE ano_lancamento IS NULL');
  }

  if (await columnExists(connection, 'filmes', 'sinopse')) {
    await connection.query('UPDATE filmes SET descricao = sinopse WHERE descricao IS NULL');
  }

  if (await columnExists(connection, 'filmes', 'poster_url')) {
    await connection.query('UPDATE filmes SET capa_url = poster_url WHERE capa_url IS NULL');
  }
}

async function addColumnIfMissing(connection, table, column, definition) {
  if (!(await columnExists(connection, table, column))) {
    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function tableExists(connection, table) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS total
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [process.env.DB_NAME, table]
  );

  return rows[0].total > 0;
}

async function columnExists(connection, table, column) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS total
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, table, column]
  );

  return rows[0].total > 0;
}

main().catch((error) => {
  console.error(`Falha na migration: ${error.message}`);
  process.exit(1);
});
