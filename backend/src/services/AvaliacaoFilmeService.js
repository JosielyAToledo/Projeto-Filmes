const fs = require('fs');
const path = require('path');
const AvaliacaoFilmeDAO = require('../dao/AvaliacaoFilmeDAO');
const FilmeService = require('./FilmeService');
const { isLocalMode } = require('../config/local_mode');

const LOCAL_REVIEWS_FILE = path.resolve(
  process.env.LOCAL_AVALIACOES_FILE || 'backend/data/local-avaliacoes-filmes.json'
);

function ensureLocalReviewsDir() {
  fs.mkdirSync(path.dirname(LOCAL_REVIEWS_FILE), { recursive: true });
}

function loadLocalReviews() {
  try {
    if (!fs.existsSync(LOCAL_REVIEWS_FILE)) return [];
    const content = fs.readFileSync(LOCAL_REVIEWS_FILE, 'utf8');
    const reviews = JSON.parse(content);
    return Array.isArray(reviews) ? reviews : [];
  } catch (error) {
    console.warn('Nao foi possivel carregar avaliacoes locais.', error.message);
    return [];
  }
}

function saveLocalReviews() {
  ensureLocalReviewsDir();
  fs.writeFileSync(LOCAL_REVIEWS_FILE, JSON.stringify(localReviews, null, 2));
}

const localReviews = loadLocalReviews();

class AvaliacaoFilmeService {
  constructor() {
    this.avaliacaoDAO = new AvaliacaoFilmeDAO();
    this.filmeService = new FilmeService();
  }

  async listarPorFilme(filmeId) {
    await this.filmeService.buscarPorId(filmeId);

    if (isLocalMode()) {
      return localReviews
        .filter((review) => Number(review.filme_id) === Number(filmeId))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return this.avaliacaoDAO.findByMovie(filmeId);
  }

  async salvar(filmeId, usuario, dados) {
    await this.filmeService.buscarPorId(filmeId);

    const nota = Number(dados.nota);
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      const error = new Error('A nota deve ser um numero entre 1 e 5.');
      error.statusCode = 400;
      throw error;
    }

    const comentario = String(dados.comentario || '').trim();
    if (comentario.length > 500) {
      const error = new Error('Comentario deve ter no maximo 500 caracteres.');
      error.statusCode = 400;
      throw error;
    }

    if (isLocalMode()) {
      return this.salvarLocal(filmeId, usuario, { nota, comentario });
    }

    return this.avaliacaoDAO.upsert({
      filme_id: Number(filmeId),
      usuario_id: usuario.id,
      nota,
      comentario
    });
  }

  salvarLocal(filmeId, usuario, dados) {
    const now = new Date().toISOString();
    const index = localReviews.findIndex((review) => {
      return Number(review.filme_id) === Number(filmeId)
        && Number(review.usuario_id) === Number(usuario.id);
    });

    const review = {
      id: index >= 0 ? localReviews[index].id : Date.now(),
      filme_id: Number(filmeId),
      usuario_id: usuario.id,
      usuario_nome: usuario.nome || usuario.email || 'Usuario',
      nota: dados.nota,
      comentario: dados.comentario,
      created_at: index >= 0 ? localReviews[index].created_at : now,
      updated_at: now
    };

    if (index >= 0) {
      localReviews[index] = review;
    } else {
      localReviews.push(review);
    }

    saveLocalReviews();
    return review;
  }
}

module.exports = AvaliacaoFilmeService;
