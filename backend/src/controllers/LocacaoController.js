class LocacaoController {
  index(req, res) {
    return res.json({
      message: 'Modulo de locacoes preparado para regras de aluguel e devolucao.'
    });
  }
}

module.exports = LocacaoController;
