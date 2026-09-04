const express = require('express');
const router = express.Router();
const veiculosController = require('../controllers/veiculosController');

router.get('/', veiculosController.listarTodos);
router.get('/:id', veiculosController.buscarPorId);
router.post('/', veiculosController.criar);
router.patch('/:id/status', veiculosController.atualizarStatus);

module.exports = router;
