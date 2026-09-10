const express = require('express');
const cors = require('cors');
const veiculosRouter = require('./src/routes/veiculosRoutes');

const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json());

app.use('/api/v1/veiculos', veiculosRouter);

app.use((req, res) => {
	res.status(404).json({ erro: "Rota não encontrada no servidor Binário Tech." });
});

app.listen(PORT, () => {
	console.log(`[Binário Tech] Servidor com Banco SQLite ativo na porta ${PORT}`);
});
