let telemetriaScania = [
	{ id: 1, modelo: "R450", vin: "9BS123456789", temperatura_motor: 88, status: "OK" },
	{ id: 2, modelo: "S500", vin: "9BS987654321", temperatura_motor: 102, status: "ALERTA_AQUECIMENTO" }
];

const scaniaController = {
	listarTelemetria: (req, res) => {
		res.status(200).json({ montadora: "Scania", dados: telemetriaScania });
	},

	registrarTelemetria: (req, res) => {
		const { modelo, vin, temperatura_motor } = req.body;

		if (!modelo || !vin) {
			return res.status(400).json({ erro: "Campos 'modelo' e 'vin' são obrigatórios." });
		}

		const novoRegistro = {
			id: telemetriaScania.length + 1,
			modelo,
			vin,
			temperatura_motor: temperatura_motor || 85,
			status: temperatura_motor > 95 ? "ALERTA_AQUECIMENTO" : "OK"
		};

		telemetriaScania.push(novoRegistro);
		res.status(201).json(novoRegistro);
	}
};

module.exports = scaniaController;
