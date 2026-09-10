const autorizarPerfil = (perfisPermitidos = []) => {
  return (req, res, next) => {
    // Pega o perfil do objeto req.usuario (injetado pelo autenticarToken)
    const perfilUsuario = req.usuario?.perfil;

    if (!perfilUsuario) {
      return res.status(401).json({
        status: "ERRO",
        mensagem: "Acesso não autorizado: dados do usuário não encontrados no token."
      });
    }

    // Valida se o perfil logado está na lista de perfis autorizados
    if (!perfisPermitidos.includes(perfilUsuario)) {
      return res.status(403).json({
        status: "ERRO",
        mensagem: "Acesso negado: seu perfil não possui permissão para acessar este recurso."
      });
    }

    next();
  };
};

module.exports = autorizarPerfil;
