const app = require('./src/app');
const { connectMongoDB } = require('./src/config/mongodb');
const { ensureDefaultAdmin } = require('./src/config/default_admin');

const PORT = process.env.PORT || 3000;

// O server centraliza a inicializacao da aplicacao e das conexoes externas.
async function startServer() {
  try {
    await connectMongoDB();

    try {
      await ensureDefaultAdmin();
    } catch (error) {
      console.warn('Admin padrao nao foi sincronizado com o MySQL.');
      console.warn(`Motivo: ${error.code || error.message}`);
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
