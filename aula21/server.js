require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get('/api/v1/versao', (req, res) => {
  res.json({
    aplicacao: "API Binário Tech - CI/CD Pipeline",
    versao: "1.0.0",
    ambiente: "Servidor de Homologação Local",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`[Binário Tech] Aplicação CI/CD ativa na porta ${PORT}`);
});
