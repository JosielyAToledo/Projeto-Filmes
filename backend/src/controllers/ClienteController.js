class ClienteController {
  index(req, res) {
    return res.json({
      message: 'Modulo de clientes preparado para CRUD futuro.'
    });
  }
}

module.exports = ClienteController;
