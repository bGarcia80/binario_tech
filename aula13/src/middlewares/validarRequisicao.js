const { validationResult } = require('express-validator');

const validarRequisicao = (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(422).json({
      status: "ERRO_VALIDACAO",
      erros: erros.array().map(err => ({ campo: err.path, mensagem: err.msg }))
    });
  }
  next();
};

module.exports = validarRequisicao;
