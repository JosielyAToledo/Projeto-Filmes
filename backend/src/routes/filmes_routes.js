const { Router } = require('express');
const FilmeController = require('../controllers/FilmeController');
const authMiddleware = require('../middlewares/auth_middleware');
const adminMiddleware = require('../middlewares/admin_middleware');
const upload = require('../middlewares/upload_middleware');
const validationMiddleware = require('../middlewares/validation_middleware');

class FilmesRoutes {
  constructor() {
    this.router = Router();
    this.filmeController = new FilmeController();
    this.register();
  }

  register() {
    this.router.get('/', this.filmeController.index);
    this.router.get('/exportar/json', authMiddleware, adminMiddleware, this.filmeController.exportarJSON);
    this.router.post('/importar/json', authMiddleware, adminMiddleware, upload.single('arquivo'), this.filmeController.importarJSON);
    this.router.get('/:id', this.filmeController.show);
    this.router.post('/', authMiddleware, adminMiddleware, upload.single('capa'), validationMiddleware(['titulo']), this.filmeController.store);
    this.router.put('/:id', authMiddleware, adminMiddleware, upload.single('capa'), validationMiddleware(['titulo']), this.filmeController.update);
    this.router.delete('/:id', authMiddleware, adminMiddleware, this.filmeController.destroy);
  }
}

module.exports = new FilmesRoutes().router;
