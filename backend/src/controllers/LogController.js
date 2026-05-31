const LogService = require('../services/LogService');

class LogController {
  constructor() {
    this.logService = new LogService();
  }

  index = async (req, res, next) => {
    try {
      const logs = await this.logService.listar(req.query);
      return res.json(logs);
    } catch (error) {
      return next(error);
    }
  };

  exportarXML = async (req, res, next) => {
    try {
      const xml = await this.logService.exportarXML(req.query);
      res.setHeader('Content-Type', 'application/xml');
      return res.send(xml);
    } catch (error) {
      return next(error);
    }
  };

  exportarJSON = async (req, res, next) => {
    try {
      const json = await this.logService.exportarJSON(req.query);
      return res.json(json);
    } catch (error) {
      return next(error);
    }
  };

  exportarPDF = async (req, res, next) => {
    try {
      const pdf = await this.logService.exportarPDF(req.query);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="logs-catalogo7.pdf"');
      return res.send(Buffer.from(pdf, 'binary'));
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = LogController;
