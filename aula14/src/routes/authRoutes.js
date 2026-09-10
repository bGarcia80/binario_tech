const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const autenticarToken = require('../middlewares/autenticarToken');
const autorizarPerfil = require('../middlewares/autorizarPerfil');

// Rotas públicas
router.post('/register', authController.registrar);
router.post('/login', authController.login);

// Rota privada comum (qualquer perfil autenticado)
router.get('/perfil', autenticarToken, authController.perfil);

// Exemplo: Rota privada exclusiva para ADMIN
router.get('/admin/painel', autenticarToken, autorizarPerfil(['ADMIN']), (req, res) => {
  res.status(200).json({
    status: "SUCESSO",
    mensagem: "Bem-vindo ao painel administrativo!",
    usuario: req.usuario
  });
});

// Exemplo: Rota privada para ADMIN e GERENTE
router.get('/relatorios', autenticarToken, autorizarPerfil(['ADMIN', 'GERENTE']), (req, res) => {
  res.status(200).json({
    status: "SUCESSO",
    mensagem: "Acesso concedido aos relatórios operacionais."
  });
});

module.exports = router;
