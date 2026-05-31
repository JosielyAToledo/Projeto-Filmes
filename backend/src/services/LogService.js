const mongoose = require('mongoose');
const Log = require('../models/Log');

class LogService {
  async registrar(dados) {
    if (!isMongoConnected()) {
      return null;
    }

    return Log.create({
      timestamp: new Date(),
      ...dados
    });
  }

  async listar(filtros = {}) {
    if (!isMongoConnected()) {
      return [];
    }

    const query = {};

    if (filtros.metodo) {
      query.metodo = filtros.metodo;
    }

    if (filtros.usuario) {
      query.usuario = filtros.usuario;
    }

    if (filtros.statusCode) {
      query.statusCode = Number(filtros.statusCode) || filtros.statusCode;
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

  async exportarXML(filtros = {}) {
    const logs = await this.listar(filtros);
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

  async exportarJSON(filtros = {}) {
    const logs = await this.listar(filtros);
    return {
      exportacao: {
        formato: 'JSON',
        gerado_em: new Date().toISOString(),
        total: logs.length,
        logs
      }
    };
  }

  async exportarPDF(filtros = {}) {
    const logs = await this.listar(filtros);
    const linhas = [
      'Relatorio de Logs - Catalogo7',
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      `Total de logs: ${logs.length}`,
      '',
      ...logs.slice(0, 24).map((log) => {
        const data = log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : '-';
        return `${data} | ${log.usuario || 'anonimo'} | ${log.acao || '-'} | ${log.statusCode || '-'}`;
      })
    ];

    return makeSimplePDF(linhas);
  }
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapePDFText(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()\\]/g, '\\$&');
}

function makeSimplePDF(lines) {
  const content = [
    'BT',
    '/F1 18 Tf',
    '50 790 Td',
    '(Relatorio Catalogo7) Tj',
    '/F1 11 Tf',
    '0 -28 Td',
    ...lines.map((line) => `(${escapePDFText(line)}) Tj 0 -18 Td`),
    'ET'
  ].join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return pdf;
}

module.exports = LogService;
