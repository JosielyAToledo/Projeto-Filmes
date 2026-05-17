const app = require('./src/app');
const { connectMongoDB } = require('./src/config/mongodb');

const PORT = process.env.PORT || 3000;

// O server centraliza a inicializacao da aplicacao e das conexoes externas.
async function startServer() {
  try {
    await connectMongoDB();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
