const veiculoController = {
  cadastrar: (req, res, next) => {
    try {
      const { placa, chassi, capacidadeCargaKg } = req.body;
      
      // Simulação de erro interno não previsto se chassi for especial
      if (chassi === "ERRO_SIMULADO_500") {
        throw new Error("Falha crítica no processamento interno do servidor!");
      }

      res.status(201).json({
        mensagem: "Veículo cadastrado com sucesso e dados validados!",
        veiculo: { placa, chassi, capacidadeCargaKg, registradoEm: new Date() }
      });
    } catch (erro) {
      next(erro); // Encaminha o erro para o Middleware Global
    }
  }
};

module.exports = veiculoController;
