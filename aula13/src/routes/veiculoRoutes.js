const express = require('express');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');
const { regrasCadastroVeiculo } = require('../middlewares/veiculoValidator');
const validarRequisicao = require('../middlewares/validarRequisicao');

router.post('/', regrasCadastroVeiculo, validarRequisicao, veiculoController.cadastrar);

module.exports = router;
