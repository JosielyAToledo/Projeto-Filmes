require('dotenv').config();

const cors = require('cors');
const express = require('express');
const path = require('path');

const authRoutes = require('./routes/auth_routes');
const clientesRoutes = require('./routes/clientes_routes');
const filmesRoutes = require('./routes/filmes_routes');
const locacoesRoutes = require('./routes/locacoes_routes');
const relatoriosRoutes = require('./routes/relatorios_routes');
const logsRoutes = require('./routes/logs_routes');
const mysqlPool = require('./config/mysql');
const logMiddleware = require('./middlewares/log_middleware');
const errorMiddleware = require('./middlewares/error_middleware');

const app = express();

// Middlewares globais de infraestrutura HTTP.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disponibiliza capas enviadas por upload para acesso publico.
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'backend/src/uploads')));

// Em producao, o Express tambem entrega a interface web.
app.use(express.static(path.resolve(__dirname, '../../frontend')));

// Registra logs de todas as requisicoes no MongoDB.
app.use(logMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Projeto-Filmes' });
});

app.get('/health/mysql', async (req, res) => {
  try {
    await mysqlPool.query('SELECT 1');
    return res.json({ status: 'ok', mysql: 'connected' });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      mysql: 'disconnected',
      code: error.code || 'UNKNOWN'
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/index.html'));
});

// Routers separam cada modulo da aplicacao.
app.use('/auth', authRoutes);
app.use('/clientes', clientesRoutes);
app.use('/filmes', filmesRoutes);
app.use('/locacoes', locacoesRoutes);
app.use('/relatorios', relatoriosRoutes);
app.use('/logs', logsRoutes);

// Middleware de erro deve ser o ultimo da cadeia.
app.use(errorMiddleware);

module.exports = app;
