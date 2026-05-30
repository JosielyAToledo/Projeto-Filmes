const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema(
  {
    endpoint: { type: String },
    metodo: { type: String },
    usuario: { type: String, default: 'Não autenticado' },
    acao: { type: String, required: true, default: 'ACESSO_ROTA' },
    tipoEvento: { type: String, default: 'rota' },
    descricao: { type: String },
    tabela: { type: String },
    registroId: { type: String },
    sucesso: { type: Boolean },
    antes: { type: mongoose.Schema.Types.Mixed },
    depois: { type: mongoose.Schema.Types.Mixed },
    dadosInseridos: { type: mongoose.Schema.Types.Mixed },
    dadosExcluidos: { type: mongoose.Schema.Types.Mixed },
    erro: { type: String },
    stackTrace: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    statusCode: { type: Number },
    tempoRespostaMs: { type: Number },
    timestamp: { type: Date, default: Date.now }
  },
  {
    collection: 'logs',
    bufferCommands: false
  }
);

module.exports = mongoose.model('Log', LogSchema);
