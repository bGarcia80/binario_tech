const validaCnh = (req, res, next) => {
        const { cnh } = req.body;

        // Expressão regular para garantir que contenha exatamente 11 números (de 0 a 9)
        const regexCnh = /^\d{11}$/;

        // Se a CNH não foi enviada ou não passar na validação do Regex
        if (!cnh || !regexCnh.test(cnh)) {
                return res.status(400).json({ 
                        erro: "CNH inválida. A CNH informada deve conter exatamente 11 dígitos numéricos." 
                });
        }

        // Se estiver tudo certo, repassa a requisição para a rota final
        next();
};

module.exports = validaCnh;
