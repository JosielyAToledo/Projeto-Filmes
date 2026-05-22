const app = require('./src/app');
const { connectMongoDB } = require('./src/config/mongodb');
const { ensureDefaultAdmin } = require('./src/config/default_admin');
const { isLocalMode } = require('./src/config/local_mode');

const PORT = process.env.PORT || 3000;

// O server centraliza a inicializacao da aplicacao e das conexoes externas.
async function startServer() {
  try {
    if (isLocalMode()) {
      console.log('Modo local ativo: MySQL e MongoDB nao serao conectados.');
    } else {
      await connectMongoDB();

      try {
        await ensureDefaultAdmin();
      } catch (error) {
        console.warn('Admin padrao nao foi sincronizado com o MySQL.');
        console.warn(`Motivo: ${error.code || error.message}`);
      }
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
