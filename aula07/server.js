const express = require('express');
const cors = require('cors');
const scaniaRoutes = require('./src/routes/scaniaRoutes');
const mercedesRoutes = require('./src/routes/mercedesRoutes');

const app = express();
const PORT = 3004;

// Middlewares
app.use(cors());
app.use(express.json());

// Logger de Requisições
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} em ${req.url}`);
	next();
});

// Agrupamento de Rotas por Montadora
app.use('/api/v1/telemetria/scania', scaniaRoutes);
app.use('/api/v1/telemetria/mercedes', mercedesRoutes);

// Rota 404
app.use((req, res) => {
	res.status(404).json({ erro: "Módulo ou Rota de Telemetria não encontrada." });
});

app.listen(PORT, () => {
	console.log(`[Binário Tech] Servidor Modularizado Ativo na Porta ${PORT}`);
});
