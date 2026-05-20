const mongoose = require('mongoose');

// MongoDB e usado para registros operacionais sem misturar logs ao banco relacional.
async function connectMongoDB() {
  const mongoURI = process.env.MONGODB_URI;

  mongoose.set('strictQuery', true);

  if (!mongoURI) {
    console.warn('MongoDB nao conectado. Variavel MONGODB_URI nao definida.');
    return false;
  }

  try {
    await withTimeout(
      mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000
      }),
      8000
    );
    console.log('MongoDB conectado');
    return true;
  } catch (error) {
    console.warn('MongoDB nao conectado. A API vai subir, mas os logs ficarao desativados temporariamente.');
    console.warn(`Motivo: ${error.message}`);
    return false;
  }
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error(`Tempo limite de conexao MongoDB excedido (${timeoutMs}ms)`)), timeoutMs);
    })
  ]);
}

module.exports = { connectMongoDB };
