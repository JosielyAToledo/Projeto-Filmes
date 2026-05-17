const RelatorioService = require('../services/RelatorioService');

class RelatorioController {
  constructor() {
    this.relatorioService = new RelatorioService();
  }

  resumoJSON = async (req, res, next) => {
    try {
      const resumo = await this.relatorioService.resumoJSON();
      return res.json(resumo);
    } catch (error) {
      return next(error);
    }
  };

  dadosGrafico = async (req, res, next) => {
    try {
      const dados = await this.relatorioService.dadosGraficoLocacoes();
      return res.json(dados);
    } catch (error) {
      return next(error);
    }
  };

  relatorioPDF = async (req, res, next) => {
    try {
      const resultado = await this.relatorioService.relatorioPDFPlaceholder();
      return res.json(resultado);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = RelatorioController;
