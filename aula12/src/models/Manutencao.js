/*
Codigo 0: const mongoose = require('mongoose');

const itemPecaSchema = new mongoose.Schema({
        nomePeca: { type: String, required: true },
        quantidade: { type: Number, required: true, default: 1 },
        custoUnitario: { type: Number, required: true }
});

const manutencaoSchema = new mongoose.Schema({
        veiculoPlaca: { type: String, required: true, upperCase: true },
        tipoManutencao: {
                type: String,
                enum: ['PREVENTIVA', 'CORRETIVA', 'EMERGENCIAL'],
                default: 'PREVENTIVA'
        },
        custoTotal: { type: Number, required: true },
        pecasSubstituidas: [itemPecaSchema],
        status: { type: String, enum: ['ABERTA', 'EM ANDAMENTO', 'CONCLUIDA'], default: 'ABERTA' }
}, {
        timestamp: true
});

module.exports = mongoose.model('Manutencao', manutencaoSchema);
*/
//atividade 3

const mongoose = require('mongoose');

const itemPecaSchema = new mongoose.Schema({
        nomePeca: { type: String, required: true },
        quantidade: { type: Number, required: true, default: 1 },
        custoUnitario: {
                type: Number,
                required: true,
                min: [0, 'O custo unitário não pode ser negativo.'] // Exercício 3
        }
});

const manutencaoSchema = new mongoose.Schema({
        veiculoPlaca: { type: String, required: true, upperCase: true },
        tipoManutencao: {
                type: String,
                enum: ['PREVENTIVA', 'CORRETIVA', 'EMERGENCIAL'],
                default: 'PREVENTIVA'
        },
        custoTotal: { type: Number, required: true },
        pecasSubstituidas: [itemPecaSchema],
        status: { type: String, enum: ['ABERTA', 'EM ANDAMENTO', 'CONCLUIDA'], default: 'ABERTA' }
}, {
        timestamps: true // Ajustado de timestamp para timestamps
});

module.exports = mongoose.model('Manutencao', manutencaoSchema);
