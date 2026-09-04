const express = require('express');
const router = express.Router();

// Banco de dados em memória (substitua por um banco real depois)
let manutencoes = [
        { id: 1, placaCaminhao: "ABC-1234", descricao: "Troca de óleo e filtros", valorEstimado: 850.00, status: "Pendente" },
        { id: 2, placaCaminhao: "XYZ-9876", descricao: "Revisão do sistema de freios", valorEstimado: 2300.00, status: "Aprovado" }
];

// GET: Listar todas as manutenções (orçamentos)
router.get('/', (req, res) => {
    res.status(200).json(manutencoes);
});

// POST: Cadastrar um novo orçamento de manutenção
router.post('/', (req, res) => {
    const { placaCaminhao, descricao, valorEstimado, dataPrevisao } = req.body;

    // Validação simples dos dados recebidos
    if (!placaCaminhao || !descricao || !valorEstimado) {
        return res.status(400).json({ 
            erro: 'Dados incompletos. Informe placaCaminhao, descricao e valorEstimado.' 
        });
    }

    // Criação do objeto do novo orçamento
    const novoOrcamento = {
        id: manutencoes.length > 0 ? manutencoes[manutencoes.length - 1].id + 1 : 1,
        placaCaminhao,
        descricao,
        valorEstimado,
        dataPrevisao: dataPrevisao || new Date().toISOString().split('T')[0],
        status: 'Pendente',
        dataCriacao: new Date()
    };

    // Salva no "banco de dados"
    manutencoes.push(novoOrcamento);

    // Retorna sucesso
    res.status(201).json({
        mensagem: 'Orçamento de manutenção cadastrado com sucesso!',
        manutencao: novoOrcamento
    });
});

module.exports = router;
