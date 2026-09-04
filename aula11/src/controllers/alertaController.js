const Alerta = require('../models/Alerta');

const alertaController = {
	// Salvar novo documento BSON
	criarAlerta: async (req, res) => {
		try {
			const { equipamentoID, nivelSeveridade, temperaturaMedida, metadados } = req.body;

			const novoAlerta = await Alerta.create({
				equipamentoID,
				nivelSeveridade,
				temperaturaMedida,
				metadados
			});

			res.status(201).json(novoAlerta);
		}	catch (erro) {
			res.status(400).json({ erro: "Erro ao salvar alerta no MongoDB", detalhe: erro.message });
		}
	},

	// Listar todos os alertas registrados
	listarAlertas: async (req, res) => {
		try {
			const alertas = await Alerta.find().sort({ registradoEM: -1 });
			res.status(200).json(alertas);
		}	catch (erro) {
			res.status(500).json({ erro: "Erro ao consultar coleção no MongoDB" });
		}
	},

	// Buscar alertas filtrando por nivelSeveridade via parâmetro de rota (/severidade/:nivel)
        buscarPorSeveridade: async (req, res) => {
                try {
                        const { nivel } = req.params;

                        // Trata o parâmetro para número se for numérico, senão mantém como string
                        const nivelSeveridade = isNaN(Number(nivel)) ? nivel : Number(nivel);

                        const alertas = await Alerta.find({ nivelSeveridade }).sort({ registradoEM: -1 });

                        res.status(200).json(alertas);
                }       catch (erro) {
                        res.status(500).json({ 
                                erro: "Erro ao filtrar alertas por severidade no MongoDB", 
                                detalhe: erro.message 
                        });
                }
        }
};

module.exports = alertaController;
