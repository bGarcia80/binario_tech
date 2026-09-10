const { body } = require('express-validator');
const anoAtual = new Date().getFullYear;

const regrasCadastroVeiculo = [
	  body('placa')
	    .notEmpty().withMessage('A placa do veículo é obrigatória.')
	    .isString().withMessage('A placa deve ser um texto.')
	    .trim()
	    .toUpperCase()
	    .isLength({ min: 7, max: 8 }).withMessage('A placa deve ter entre 7 e 8 caracteres.'),
	  
	  body('chassi')
	    .notEmpty().withMessage('O chassi é obrigatório.')
	    .isLength({ min: 17, max: 17 }).withMessage('O chassi deve possuir exatamente 17 caracteres.'),
	    
	  body('capacidadeCargaKg')
	    .notEmpty().withMessage('A capacidade de carga é obrigatória.')
	    .isFloat({ min: 100 }).withMessage('A capacidade de carga deve ser um número maior ou igual a 100 Kg.'),

	  body('anoFabricacao')
            .optional({ checkFalsy: true })
            .isInt({ min: 2000, max: anoAtual }).withMessage(`O ano de fabricação deve ser um número inteiro entre 2000 e ${anoAtual}.`)
];

module.exports = { regrasCadastroVeiculo };
