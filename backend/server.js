const app = require('./src/app');
const { connectMongoDB } = require('./src/config/mongodb');
const { ensureDefaultAdmin } = require('./src/config/default_admin');

const PORT = process.env.PORT || 3000;

// O server centraliza a inicializacao da aplicacao e das conexoes externas.
async function startServer() {
  try {
    await connectMongoDB();
    await ensureDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
