let telemetriaMercedes = [
    { id: 1, modelo: "Actros 2651", vin: "9BM123456789", temperatura_motor: 87, status: "OK" },
    { id: 2, modelo: "Atego 1719", vin: "9BM987654321", temperatura_motor: 98, status: "ALERTA_AQUECIMENTO" }
];

const mercedesController = {
    listarTelemetria: (req, res) => {
        res.status(200).json({ montadora: "Mercedes-Benz", dados: telemetriaMercedes });
    },

    registrarTelemetria: (req, res) => {
        const { modelo, vin, temperatura_motor } = req.body;

        if (!modelo || !vin) {
            return res.status(400).json({ erro: "Campos 'modelo' e 'vin' são obrigatórios." });
        }

        const novoRegistro = {
            id: telemetriaMercedes.length + 1,
            modelo,
            vin,
            temperatura_motor: temperatura_motor || 85,
            status: temperatura_motor > 95 ? "ALERTA_AQUECIMENTO" : "OK"
        };

        telemetriaMercedes.push(novoRegistro);
        res.status(201).json(novoRegistro);
    }
};

module.exports = mercedesController;
