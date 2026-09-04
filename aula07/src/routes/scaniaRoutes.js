const express = require('express');
const router = express.Router();
const scaniaController = require('../controllers/scaniaController');
const validaVin = require('../middlewares/validaVin');

router.get('/', scaniaController.listarTelemetria);
router.post('/', validaVin, scaniaController.registrarTelemetria);

module.exports = router;
