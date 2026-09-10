const jwt = require('jsonwebtoken');

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ status: "ERRO", mensagem: "Acesso negado. Token não fornecido." });
  }

  try {
    const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuarioVerificado;
    next();
  } catch (erro) {
    return res.status(403).json({ status: "ERRO", mensagem: "Token inválido ou expirado." });
  }
};

module.exports = autenticarToken;
