const express = require('express');
const app = express();
const PORT = 3004;

app.use(express.json());

app.get('/api/v1/status-servidor', (req, res) => {
	res.json({
		status: "ONLINE",
		ambiente: "Servidor Local de Prova - Binário Tech",
		usuario: process.env.USER || "aluno",
		dataCheck: new Date()
	});
});

app.listen(PORT, () => {
	console.log(`[Binário Tech] Servidor de Validação da Aula 16 ativo na porta ${PORT}`);
});
