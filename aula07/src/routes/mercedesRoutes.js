const express = require('express');
const router = express.Router();
const mercedesController = require('../controllers/mercedesController');

router.get('/', mercedesController.listarTelemetria);
router.post('/', mercedesController.registrarTelemetria);

module.exports = router;
