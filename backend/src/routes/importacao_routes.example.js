const { Router } = require('express');

const router = Router();

// Exemplo de router futuro para importacao JSON em lote.
router.post('/json', (req, res) => {
  return res.status(501).json({
    message: 'Importacao JSON preparada para implementacao futura.'
  });
});

module.exports = router;
