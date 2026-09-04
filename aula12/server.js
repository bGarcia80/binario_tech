require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarBanco = require('./src/config/database');
const manutencaoRoutes = require('./src/routes/manutencaoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/manutencoes', manutencaoRoutes);

conectarBanco().then(() => {
	app.listen(PORT, () => {
		console.log(`[Binário Tech] Servidor NoSQL Aula 12 ativo na porta ${PORT}`);
	});
});
