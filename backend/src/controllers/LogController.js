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
      const xml = await this.logService.exportarXML();
      res.setHeader('Content-Type', 'application/xml');
      return res.send(xml);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = LogController;
