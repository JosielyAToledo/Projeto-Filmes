const mongoose = require('mongoose');

// MongoDB e usado para registros operacionais sem misturar logs ao banco relacional.
async function connectMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/projeto_filmes_logs';

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB conectado');
}

module.exports = { connectMongoDB };
