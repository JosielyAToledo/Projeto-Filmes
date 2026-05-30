const fs = require('fs');
const path = require('path');
const FavoritoFilmeDAO = require('../dao/FavoritoFilmeDAO');
const FilmeService = require('./FilmeService');
const { isLocalMode } = require('../config/local_mode');

const LOCAL_FAVORITES_FILE = path.resolve(
  process.env.LOCAL_FAVORITOS_FILE || 'backend/data/local-favoritos-filmes.json'
);

function ensureLocalFavoritesDir() {
  fs.mkdirSync(path.dirname(LOCAL_FAVORITES_FILE), { recursive: true });
}

function loadLocalFavorites() {
  try {
    if (!fs.existsSync(LOCAL_FAVORITES_FILE)) return [];
    const content = fs.readFileSync(LOCAL_FAVORITES_FILE, 'utf8');
    const favorites = JSON.parse(content);
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.warn('Nao foi possivel carregar favoritos locais.', error.message);
    return [];
  }
}

function saveLocalFavorites() {
  ensureLocalFavoritesDir();
  fs.writeFileSync(LOCAL_FAVORITES_FILE, JSON.stringify(localFavorites, null, 2));
}

const localFavorites = loadLocalFavorites();

class FavoritoFilmeService {
  constructor() {
    this.favoritoDAO = new FavoritoFilmeDAO();
    this.filmeService = new FilmeService();
  }

  async listarPorUsuario(usuarioId) {
    if (isLocalMode()) {
      return localFavorites
        .filter((favorite) => Number(favorite.usuario_id) === Number(usuarioId))
        .map((favorite) => ({ filme_id: favorite.filme_id }));
    }

    return this.favoritoDAO.findByUser(usuarioId);
  }

  async adicionar(filmeId, usuarioId) {
    await this.filmeService.buscarPorId(filmeId);

    if (isLocalMode()) {
      const exists = localFavorites.some((favorite) => {
        return Number(favorite.filme_id) === Number(filmeId)
          && Number(favorite.usuario_id) === Number(usuarioId);
      });

      if (!exists) {
        localFavorites.push({
          filme_id: Number(filmeId),
          usuario_id: Number(usuarioId),
          created_at: new Date().toISOString()
        });
        saveLocalFavorites();
      }
      return;
    }

    await this.favoritoDAO.add(Number(filmeId), usuarioId);
  }

  async remover(filmeId, usuarioId) {
    if (isLocalMode()) {
      const index = localFavorites.findIndex((favorite) => {
        return Number(favorite.filme_id) === Number(filmeId)
          && Number(favorite.usuario_id) === Number(usuarioId);
      });

      if (index >= 0) {
        localFavorites.splice(index, 1);
        saveLocalFavorites();
      }
      return;
    }

    await this.favoritoDAO.remove(Number(filmeId), usuarioId);
  }
}

module.exports = FavoritoFilmeService;
