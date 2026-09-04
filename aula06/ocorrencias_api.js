const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const ARQUIVO_DADOS = path.join(__dirname, 'ocorrencias.json');

app.use(cors());
app.use(express.json());

// Função Auxiliar: Ler Arquivo JSON
async function lerOcorrencias() {
	try {
		const dados = await fs.readFile(ARQUIVO_DADOS, 'utf-8');
		return JSON.parse(dados);
	} catch (erro) {
		// Se o arquivo não existir, retorna array vazio e cria o arquivo
		await fs.writeFile(ARQUIVO_DADOS, '[]', 'utf-8');
		return [];
	}
}

// Função Auxiliar: Salvar no Arquivo JSON
async function salvarOcorrencias(ocorrencias) {
	await fs.writeFile(ARQUIVO_DADOS, JSON.stringify(ocorrencias, null, 2), 'utf-8');
}

// ROTA 1: Listar todas as ocorrências
app.get('/api/v1/ocorrencias', async (req, res) => {
	try {
		const ocorrencias = await lerOcorrencias();
		res.status(200).json(ocorrencias);
	} catch (erro) {
		res.status(500).json({ erro: "Erro ao ler base de dados em disco." });
	}
});

// ROTA 2: Filtrar ocorrências por montadora
app.get('/api/v1/ocorrencias/montadora/:nome', async (req, res) => {
        try {
                const { nome } = req.params;
                const ocorrencias = await lerOcorrencias();
 
                // Filtra as ocorrências comparando o nome em minúsculas (case-insensitive)
                const filtradas = ocorrencias.filter(
                        (item) => item.montadora && item.montadora.toLowerCase() === nome.toLowerCase()
                );
 
                res.status(200).json(filtradas);
        } catch (erro) {
                res.status(500).json({ erro: "Erro ao filtrar ocorrências por montadora." });
        }
});

// ROTA 3: Cadastrar nova ocorrência na frota
app.post('/api/v1/ocorrencias', async (req, res) => {
	try {
		const { montadora, placa, descricao, gravidade } = req.body;

		if (!montadora || !placa || !descricao) {
			return res.status(400).json({ erro: "Montadora, placa e descrição são obrigatórios." });
		}

		const ocorrencias = await lerOcorrencias();
		const novaOcorrencia = {
			id: Date.now(),
			montadora,
			placa,
			descricao,
			gravidade: gravidade || "MEDIA",
			data_registro: new Date().toISOString()
		};

		ocorrencias.push(novaOcorrencia);
		await salvarOcorrencias(ocorrencias);

		res.status(201).json(novaOcorrencia);
	} catch (erro) {
		res.status(500).json({ erro: "Erro ao salvar ocorrência em disco." });
	}
});

// ROTA 4: Remover ocorrência por ID
app.delete('/api/v1/ocorrencias/:id', async (req, res) => {
        try {
                const { id } = req.params;
                const ocorrencias = await lerOcorrencias();

                // Converte o ID para número (pois no POST é gerado via Date.now())
                const idNum = Number(id);
                const indice = ocorrencias.findIndex((item) => item.id === idNum);

                if (indice === -1) {
                        return res.status(404).json({ erro: "Ocorrência não encontrada." });
                }

                // Remove o item do array
                const [ocorrenciaRemovida] = ocorrencias.splice(indice, 1);

                // Salva a lista atualizada
                await salvarOcorrencias(ocorrencias);

                res.status(200).json({
                        mensagem: "Ocorrência removida com sucesso.",
                        ocorrencia: ocorrenciaRemovida
                });
        } catch (erro) {
                res.status(500).json({ erro: "Erro ao remover ocorrência do arquivo." });
        }
});

app.listen(PORT, () => {
	console.log(`[Binário Tech] API de Ocorrências ativa na porta ${PORT}`);
});

