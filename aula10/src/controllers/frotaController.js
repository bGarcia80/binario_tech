const db = require('../database/connection');

const frotaController = {
	listarTudo: async (req, res, next) => {
		try {
			const dados = await db('veiculos')
			.leftJoin('telemetria', ' veiculos.id', '=', 'telemetria.veiculo_id')
			.select(
				'veiculos_id as veiculo_id',
				'veiculos.placa',
				'veiculos.modelo',
				'telemetria.velocidade',
				'telemetria.temperatura_motor'
			);

			res.status(200).json(dados);
		} catch (erro) {
			next(erro);
		}
	},

	cadastrarVeiculo: async (req, res, next) => {
		try {
			const { placa, montadora, modelo } = req.body;

			if (!placa || !montadora || !modelo) {
				return res.status(400).json({ erro: "Campos 'placa', 'montadora' e modelo' são obrigatórios." });
			}

			const [id] = await db ('veiculos').insert({ placa, montadora, modelo });
			res.status(201).json({ id, placa, montadora, modelo });
		} catch (erro) {
			next(erro);
		}
	}
};

module.exports = frotaController;
