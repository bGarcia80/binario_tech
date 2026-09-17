const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validarJWT = require('../middlewares/validarJWT');

// Rotas Públicas
router.post('/register', authController.registrar);
router.post('/login', authController.login);

// Rota privada (exige Token JWT)
router.get('/perfil', validarJWT, authController.perfil);

module.exports = router;
