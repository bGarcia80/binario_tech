const express = require('express');
const router = express.Router();
const telemetriaController = require('../controllers/telemetriaController');
const db = require('../database/connection');

// Auxiliar: Rota para popular veículo de teste
router.post('/veiculo-teste', async (req, res) => {
	const { placa, montadora, modelo } = req.body;
	const [id] = await db('veiculos').insert({ placa, montadora, modelo });
	res.status(201).json({ id, placa, montadora, modelo });
});

router.post('/', telemetriaController.registrarLeitura);
router.get('/relatorio', telemetriaController.listarRelatorioCompleto);
router.get('/veiculo/:id', telemetriaController.buscarPorVeiculo);

module.exports = router;
