class IService {
  async listar() {
    throw new Error('Metodo listar deve ser implementado.');
  }

  async buscarPorId() {
    throw new Error('Metodo buscarPorId deve ser implementado.');
  }

  async criar() {
    throw new Error('Metodo criar deve ser implementado.');
  }

  async atualizar() {
    throw new Error('Metodo atualizar deve ser implementado.');
  }

  async remover() {
    throw new Error('Metodo remover deve ser implementado.');
  }
}

module.exports = IService;
