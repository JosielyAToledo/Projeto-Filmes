const { Router } = require('express');
const FilmeController = require('../controllers/FilmeController');
const AvaliacaoFilmeController = require('../controllers/AvaliacaoFilmeController');
const FavoritoFilmeController = require('../controllers/FavoritoFilmeController');
const authMiddleware = require('../middlewares/auth_middleware');
const adminMiddleware = require('../middlewares/admin_middleware');
const upload = require('../middlewares/upload_middleware');
const validationMiddleware = require('../middlewares/validation_middleware');

class FilmesRoutes {
  constructor() {
    this.router = Router();
    this.filmeController = new FilmeController();
    this.avaliacaoFilmeController = new AvaliacaoFilmeController();
    this.favoritoFilmeController = new FavoritoFilmeController();
    this.register();
  }

  register() {
    this.router.get('/', this.filmeController.index);
    this.router.get('/exportar/json', authMiddleware, adminMiddleware, this.filmeController.exportarJSON);
    this.router.post('/importar/json', authMiddleware, adminMiddleware, upload.single('arquivo'), this.filmeController.importarJSON);
    this.router.get('/favoritos/me', authMiddleware, this.favoritoFilmeController.index);
    this.router.get('/avaliacoes/me', authMiddleware, this.avaliacaoFilmeController.minhas);
    this.router.get('/:id/avaliacoes', this.avaliacaoFilmeController.index);
    this.router.post('/:id/avaliacoes', authMiddleware, this.avaliacaoFilmeController.store);
    this.router.post('/:id/favorito', authMiddleware, this.favoritoFilmeController.store);
    this.router.delete('/:id/favorito', authMiddleware, this.favoritoFilmeController.destroy);
    this.router.get('/:id', this.filmeController.show);
    this.router.post('/', authMiddleware, adminMiddleware, upload.single('capa'), validationMiddleware(['titulo']), this.filmeController.store);
    this.router.put('/:id', authMiddleware, adminMiddleware, upload.single('capa'), validationMiddleware(['titulo']), this.filmeController.update);
    this.router.delete('/:id', authMiddleware, adminMiddleware, this.filmeController.destroy);
  }
}

module.exports = new FilmesRoutes().router;
