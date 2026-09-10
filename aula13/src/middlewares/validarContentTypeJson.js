const validarContentTypeJson = (req, res, next) => {
  if (req.method === 'POST' && !req.is('json')) {
    return res.status(400).json({
      erro: 'O cabeçalho Content-Type deve ser application/json para requisições POST.'
    });
  }
  
  next();
};

module.exports = validarContentTypeJson;
