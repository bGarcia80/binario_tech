/*Codigo 0:
/const Manutencao = require('../models/Manutencao');

const manutencaoController = {
  // Criar Registro com Subdocumentos
        criar: async (req, res) => {
                try {
                        const novaManutencao = await Manutencao.create(req.body);
                        res.status(201).json(novaManutencao);
                } catch (erro) {
                        res.status(400).json({ erro: "Erro ao registrar manutenção", detalhe: erro.message });
                }
        },

        // Listar com Filtro Avançado ($gte / $lte em Custo)
        listarComFiltros: async (req, res) => {
                try {
                        const { minCusto, status } = req.query;
                        let query = {};

                        if (minCusto) {
                                query.custoTotal = { $gte: Number(minCusto) };
                        }

                        if (status) {
                                query.status = status;
                        }

                        const resultados = await Manutencao.find(query).sort({ createdAt: -1 });
                        res.status(200).json(resultados);
                } catch (erro) {
                        res.status(500).json({ erro: "Erro ao consultar manutenções." });
                }
        },

        // Atualizar Status por ID
        atualizarStatus: async (req, res) => {
                try {
                        const { id } = req.params;
                        const { status } = req.body;

                        const atualizado = await Manutencao.findByIdAndUpdate(
                                id,
                                { status },
                                { new: true, runValidators: true }
                        );

                        if (!atualizado) {
                                return res.status(404).json({ erro: "Registro de manutencao nao encontrado." });
                        }

                        res.status(200).json(atualizado);
                } catch (erro) {
                        res.status(400).json({ erro: "Erro ao atualizar registro.", detalhe: erro.message });
                }
        },

        //Deletar Registro por ID
        excluir: async (req, res) => {
                try {
                        const { id } = req.params;
                        const removido = await Manutencao.findByIdAndDelete(id);

                        if (!removido) {
                                return res.status(404).json({ erro: "Registro nao encontrado para exclusao." });
                        }

                        res.status(200).json({ mensagem: "Registro de manutencao excluido com sucesso!" });
                } catch (erro) {
                        res.status(500).json({ erro: "Erro ao excluir registro>" });
                }
        }
};

------------------------------------------------------------------------------------------
Codigo 1:

const Manutencao = require('../models/Manutencao');

const manutencaoController = {
  // Criar Registro com Subdocumentos
        criar: async (req, res) => {
                try {
                        const novaManutencao = await Manutencao.create(req.body);
                        res.status(201).json(novaManutencao);
                } catch (erro) {
                        res.status(400).json({ erro: "Erro ao registrar manutenção", detalhe: erro.message });
                }
        },

        // Listar com Filtro Avançado ($gte / $lte em Custo)
        listarComFiltros: async (req, res) => {
                try {
                        const { minCusto, status } = req.query;
                        let query = {};

                        if (minCusto) {
                                query.custoTotal = { $gte: Number(minCusto) };
                        }

                        if (status) {
                                query.status = status;
                        }

                        const resultados = await Manutencao.find(query).sort({ createdAt: -1 });
                        res.status(200).json(resultados);
                } catch (erro) {
                        res.status(500).json({ erro: "Erro ao consultar manutenções." });
                }
        },

        buscarPorPlaca: async (req, res) => {
                try {
                        const { placa } = req.params;

                                // $regex realiza busca parcial e $options: 'i' torna case-insensitive
                        const manutencoes = await Manutencao.find({
                                veiculoPlaca: { $regex: placa, $options: 'i' }
                        });

                        res.status(200).json(manutencoes);
                } catch (erro) {
                        res.status(500).json({
                                erro: "Erro ao buscar manutenções pela placa.",
                                detalhe: erro.message
                        });
                }
        },

        // Atualizar Status por ID
        atualizarStatus: async (req, res) => {
                try {
                        const { id } = req.params;
                        const { status } = req.body;

                        const atualizado = await Manutencao.findByIdAndUpdate(
                                id,
                                { status },
                                { new: true, runValidators: true }
                        );

                        if (!atualizado) {
                                return res.status(404).json({ erro: "Registro de manutencao nao encontrado." });
                        }

                        res.status(200).json(atualizado);
                } catch (erro) {
                        res.status(400).json({ erro: "Erro ao atualizar registro.", detalhe: erro.message });
                }
        },

        //Deletar Registro por ID
        excluir: async (req, res) => {
                try {
                        const { id } = req.params;
                        const removido = await Manutencao.findByIdAndDelete(id);

                        if (!removido) {
                                return res.status(404).json({ erro: "Registro nao encontrado para exclusao." });
                        }

                        res.status(200).json({ mensagem: "Registro de manutencao excluido com sucesso!" });
                } catch (erro) {
                        res.status(500).json({ erro: "Erro ao excluir registro>" });
                }
        }
};

module.exports = manutencaoController;
-------------------------------------------------------------------------------
*/
const Manutencao = require('../models/Manutencao');

const manutencaoController = {
  // Criar Registro com Subdocumentos
        criar: async (req, res) => {
                try {
                        const novaManutencao = await Manutencao.create(req.body);
                        res.status(201).json(novaManutencao);
                } catch (erro) {
                        res.status(400).json({ erro: "Erro ao registrar manutenção", detalhe: erro.message });
                }
        },

        // Listar com Filtro Avançado ($gte / $lte em Custo)
        listarComFiltros: async (req, res) => {
                try {
                        const { minCusto, status } = req.query;
                        let query = {};

                        if (minCusto) {
                                query.custoTotal = { $gte: Number(minCusto) };
                        }

                        if (status) {
                                query.status = status;
                        }

                        const resultados = await Manutencao.find(query).sort({ createdAt: -1 });
                        res.status(200).json(resultados);
                } catch (erro) {
                        res.status(500).json({ erro: "Erro ao consultar manutenções." });
                }
        },

        buscarPorPlaca: async (req, res) => {
                try {
                        const { placa } = req.params;

                                // $regex realiza busca parcial e $options: 'i' torna case-insensitive
                        const manutencoes = await Manutencao.find({
                                veiculoPlaca: { $regex: placa, $options: 'i' }
                        });

                        res.status(200).json(manutencoes);
                } catch (erro) {
                        res.status(500).json({
                                erro: "Erro ao buscar manutenções pela placa.",
                                detalhe: erro.message
                        });
                }
        },

        // Atualizar Status por ID
        atualizarStatus: async (req, res) => {
                try {
                        const { id } = req.params;
                        const { status } = req.body;

                        const atualizado = await Manutencao.findByIdAndUpdate(
                                id,
                                { status },
                                { new: true, runValidators: true }
                        );

                        if (!atualizado) {
                                return res.status(404).json({ erro: "Registro de manutencao nao encontrado." });
                        }

                        res.status(200).json(atualizado);
                } catch (erro) {
                        res.status(400).json({ erro: "Erro ao atualizar registro.", detalhe: erro.message });
                }
        },

	// Adicionar Peça ao Array com $push (POST /:id/pecas)
  	adicionarPeca: async (req, res) => {
    		try {
     			const { id } = req.params;
      			const novaPeca = req.body;

      			if (!novaPeca || Object.keys(novaPeca).length === 0) {
        			return res.status(400).json({ erro: "Dados da peça não fornecidos." });
      	}

      			const manutencaoAtualizada = await Manutencao.findByIdAndUpdate(
        		id,
        		{ $push: { pecasSubstituidas: novaPeca } },
        		{ new: true, runValidators: true }
      	);

      			if (!manutencaoAtualizada) {
        			return res.status(404).json({ erro: "Registro de manutenção não encontrado." });
      		}	

      			return res.status(200).json({
        		mensagem: "Peça adicionada com sucesso!",
        		manutencao: manutencaoAtualizada
      		});
    		}	 catch (erro) {
      				return res.status(400).json({
        		erro: "Erro ao adicionar peça à manutenção.",
        		detalhe: erro.message
      	});
    }
  },

        //Deletar Registro por ID
        excluir: async (req, res) => {
                try {
                        const { id } = req.params;
                        const removido = await Manutencao.findByIdAndDelete(id);

                        if (!removido) {
                                return res.status(404).json({ erro: "Registro nao encontrado para exclusao." });
                        }

                        res.status(200).json({ mensagem: "Registro de manutencao excluido com sucesso!" });
                } catch (erro) {
                        res.status(500).json({ erro: "Erro ao excluir registro>" });
                }
        }
};

module.exports = manutencaoController;
