const express = require('express');
const cors = require('cors');
const frotaRoutes = require('./src/routes/frotaRoutes');
const tratarErros = require('./src/middlewares/tratarErros');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/frota', frotaRoutes);

app.use((req, res) => {
	res.status(404).json({ erro: "Rota não encontrada no servidor." });
});

// Registrar Middleware de Erro (deve ficar após todas as rotas)
app.use(tratarErros);

app.listen(PORT, () => {
	console.log(`[Binário Tech] Servidor da Aula 10 ativo na porta ${PORT}`);
});


