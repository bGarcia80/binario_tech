function tratarErros(err, req, res, next) {
	console.error(`[ERRO LOG]: ${err.message}`);

	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
            erro: "Sintaxe de JSON inválida no corpo da requisição. Verifique a formatação dos dados enviados." 
        });
    }

	if (err.message && err.message.includes('UNIQUE constraint failed')) {
		return res.status(409).json({ erro: "Conflito de dados: Registro já existe com este valor único (ex: Placa)." });
	}

	if (err.message && err.message.includes ('FOREIGN KEY constraint failed')) {
		return res.status(400).json({ erro: "Erro de relacionamento: O registro pai fornecido não existe." });
	};

	return res.status(500).json({ erro: "Erro interno no servidor da Binário Tech." });
}

module.exports = tratarErros;
