const Log = require('../models/Log');

class LogService {
  async registrar(dados) {
    return Log.create({
      timestamp: new Date(),
      ...dados
    });
  }

  async listar(filtros = {}) {
    const query = {};

    if (filtros.metodo) {
      query.metodo = filtros.metodo;
    }

    if (filtros.usuario) {
      query.usuario = filtros.usuario;
    }

    if (filtros.dataInicio || filtros.dataFim) {
      query.timestamp = {};
      if (filtros.dataInicio) {
        query.timestamp.$gte = new Date(filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query.timestamp.$lte = new Date(filtros.dataFim);
      }
    }

    return Log.find(query).sort({ timestamp: -1 }).limit(200);
  }

  async exportarXML() {
    const logs = await this.listar();
    const itens = logs
      .map((log, index) => (
        `  <evento id="${index + 1}">
    <endpoint>${escapeXml(log.endpoint)}</endpoint>
    <metodo>${escapeXml(log.metodo)}</metodo>
    <usuario>${escapeXml(log.usuario)}</usuario>
    <acao>${escapeXml(log.acao)}</acao>
    <descricao>${escapeXml(log.descricao || '')}</descricao>
    <data_hora>${log.timestamp.toISOString()}</data_hora>
    <tipo_evento>${escapeXml(log.tipoEvento || '')}</tipo_evento>
    <ip_origem>${escapeXml(log.ip || '')}</ip_origem>
    <status_code>${log.statusCode || ''}</status_code>
    <tempo_resposta_ms>${log.tempoRespostaMs || ''}</tempo_resposta_ms>
    <dados_vinculados>
      <tabela>${escapeXml(log.tabela || '')}</tabela>
      <registro_id>${escapeXml(log.registroId || '')}</registro_id>
    </dados_vinculados>
  </evento>`
      ))
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<logs>\n${itens}\n</logs>`;
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = LogService;
