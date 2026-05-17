class IController {
  async index() {
    throw new Error('Metodo index deve ser implementado.');
  }

  async show() {
    throw new Error('Metodo show deve ser implementado.');
  }

  async store() {
    throw new Error('Metodo store deve ser implementado.');
  }

  async update() {
    throw new Error('Metodo update deve ser implementado.');
  }

  async destroy() {
    throw new Error('Metodo destroy deve ser implementado.');
  }
}

module.exports = IController;
