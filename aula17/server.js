require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Importado para geração de tokens
const conectarBanco = require('./src/config/database');
const autenticar = require('./src/middlewares/autenticar');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Rota Pública de Healthcheck
app.get('/api/v1/health', (req, res) => {
  res.json({ status: "PRONTO_PARA_EXAME", timestamp: new Date() });
});

// Nova Rota: Gera um JWT assinado válido por 5 minutos
app.post('/api/v1/auth/token-teste', (req, res) => {
  const payload = {
    id: "simulado_123",
    nome: "Aluno Binário Tech",
    role: "testador"
  };

  // Assina o token com a chave secreta do .env e expiração de 5 minutos ('5m')
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });

  return res.status(200).json({
    mensagem: "Token gerado com sucesso!",
    token: token,
    expiresIn: "5m"
  });
});

// Rota Protegida do Simulado
app.get('/api/v1/simulado/status', autenticar, (req, res) => {
  res.json({ mensagem: "Acesso autorizado no Servidor Local!", usuario: req.usuario });
});

conectarBanco().then(() => {
  app.listen(PORT, () => {
    console.log(`[Binário Tech] Servidor da Aula 17 ativo na porta ${PORT}`);
  });
});
