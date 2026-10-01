require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Rota de Diagnóstico do Container
app.get('/api/v1/container/info', (req, res) => {
  res.json({
    status: "OPERACIONAL",
    ambiente: process.env.NODE_ENV || "desenvolvimento",
    modulo: "Binário Tech - Conteinerização Docker",
    hostname: require('os').hostname(),
    portaInterna: PORT,
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`[Binário Tech] Microserviço rodando no container na porta ${PORT}`);
});
