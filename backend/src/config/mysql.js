const mysql = require('mysql2/promise');

function getMySQLConfig() {
  const url = process.env.MYSQL_URL || process.env.DATABASE_URL;

  if (url) {
    const parsedUrl = new URL(url);

    return {
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port || 3306),
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.replace(/^\//, '')
    };
  }

  return {
    host: process.env.MYSQL_HOST || process.env.MYSQLHOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || process.env.MYSQLPORT || 3306),
    user: process.env.MYSQL_USER || process.env.MYSQLUSER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'projeto_filmes'
  };
}

// Pool de conexoes reutilizavel para toda a camada DAO.
const pool = mysql.createPool({
  ...getMySQLConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

module.exports = pool;
