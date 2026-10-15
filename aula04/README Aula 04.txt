========================================================================
                        BINÁRIO TECH - AULA 03
                      Histórico de Versionamento
========================================================================

NOME: Ana Lívia Paixão
E-MAIL: pessoal - analiviaany@gmail.com
        educacional - ana.l.paixao@edu.senai.br

DESCRIÇÃO DO PROJETO: Inspecionar e filtrar respostas de APIs JSON via terminal e criar scripts em Bash (.sh) para testar rotas de telemetria automotiva (Scania, Mercedes-Benz, VW).

========================================================================

PRIMAIROS PASSOS:

1. Entrar
        - cd binario_tech
        - cd aula04

2. Baixar ferramentas e updates
        - npm init -y
        - npm install express

3. Criar diretório de pastas (atualizado após resolução dos exercícios)
        aula04
          |
          |-> frota_api.js
          |
          |-> crud_result.log
          |
          |-> package.json
          |
          |-> teste_crud.sh

(Outros arquivos que vem após instalação e README.txt estão sendo ignorados)

========================================================================

VERSIONAMENTO:

---

0.0.0 - frota_api.js

const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Banco de dados em memoria
let veiculos = [
    { id: 1, placa: "ABC-1234", montadora: "Scania", modelo: "R450", status: "DISPONIVEL" },
    { id: 2, placa: "XYZ-9876", montadora: "Mercedes-Benz", modelo: "Actros", status: "EM_ROTA" }
];

// 1. GET /api/v1/veiculos - Listar todos os veiculos (Suporta filtro por status query param)
app.get('/api/v1/veiculos', (req, res) => {
    const { status } = req.query;
    if (status) {
        const filtrados = veiculos.filter(v => v.status.toUpperCase() === status.toUpperCase());
        return res.status(200).json(filtrados);
    }
    res.status(200).json(veiculos);
});

// 2. GET /api/v1/veiculos/:id - Buscar veiculo por ID
app.get('/api/v1/veiculos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const veiculo = veiculos.find(v => v.id === id);
    if (!veiculo) {
        return res.status(404).json({ erro: "Veiculo nao encontrado na base de dados." });
    }
    res.status(200).json(veiculo);
});

// 3. POST /api/v1/veiculos - Cadastrar novo veiculo (Criacao)
app.post('/api/v1/veiculos', (req, res) => {
    const { placa, montadora, modelo } = req.body;
    if (!placa || !montadora || !modelo) {
        return res.status(400).json({ erro: "Campos 'placa', 'montadora' e 'modelo' sao obrigatorios." });
    }
    const novoVeiculo = {
        id: veiculos.length + 1,
        placa,
        montadora,
        modelo,
        status: "DISPONIVEL"
    };
    veiculos.push(novoVeiculo);
    res.status(201).json(novoVeiculo);
});

// 4. PATCH /api/v1/veiculos/:id/status - Atualizar status do veiculo
app.patch('/api/v1/veiculos/:id/status', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const veiculo = veiculos.find(v => v.id === id);
    
    if (!veiculo) {
        return res.status(404).json({ erro: "Veiculo nao encontrado." });
    }
    if (!status) {
        return res.status(400).json({ erro: "O campo 'status' e obrigatorio." });
    }

    veiculo.status = status.toUpperCase();
    res.status(200).json({ mensagem: "Status atualizado com sucesso!", veiculo });
});

// 5. DELETE /api/v1/veiculos/:id - Remover veiculo da frota
app.delete('/api/v1/veiculos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = veiculos.findIndex(v => v.id === id);
    if (index === -1) {
        return res.status(404).json({ erro: "Veiculo nao encontrado." });
    }
    veiculos.splice(index, 1);
    res.status(200).json({ mensagem: `Veiculo ID ${id} removido com sucesso.` });
});

app.listen(PORT, () => {
    console.log(`[Binario Tech] API de Frotas rodando em http://localhost:${PORT}`);
});

Obvservacao: Rodar node frota_api.js apos escrever o codigo, a resposta certa seria "[Binario Tech] API de Frotas rodando em http://localhost:3001"
---

0.0.0 - package.json

{
  "name": "aula04",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "type": "commonjs",
  "dependencies": {
    "express": "^5.2.1"
  }
}

---

0.0.0 - teste_crud.sh

#!/bin/bash

API_URL="http://localhost:3000/api/v1/veiculos"
LOG_FILE="crud_result.log"

# Limpa o arquivo de log caso ele já exista e insere o cabeçalho
echo "=========================================" > "$LOG_FILE"
echo "Iniciando testes CRUD - $(date)" >> "$LOG_FILE"
echo "=========================================" >> "$LOG_FILE"

# 1. CREATE: Cadastrando o primeiro veículo (ID 3)
echo -e "\n[1] Executando POST para cadastrar Veículo 1 (Volvo FH540)..." >> "$LOG_FILE"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"placa": "DEF-5678", "montadora": "Volvo", "modelo": "FH540"}' >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 2. CREATE: Cadastrando o segundo veículo (ID 4)
echo -e "\n[2] Executando POST para cadastrar Veículo 2 (Iveco Stralis)..." >> "$LOG_FILE"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"placa": "GHI-9012", "montadora": "Iveco", "modelo": "Stralis"}' >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 3. UPDATE: Atualizando todos os dados do veículo criado no passo 1 (ID 3) usando o novo PUT
echo -e "\n[3] Executando PUT para atualizar todos os dados do Veículo ID 3..." >> "$LOG_FILE"
curl -s -X PUT "$API_URL/3" \
  -H "Content-Type: application/json" \
  -d '{"placa": "DEF-5678", "montadora": "Volvo", "modelo": "FH540", "status": "EM MANUTENCAO"}' >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 4. DELETE: Deletando o veículo criado no passo 2 (ID 4)
echo -e "\n[4] Executando DELETE para remover o Veículo ID 4..." >> "$LOG_FILE"
curl -s -X DELETE "$API_URL/4" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 5. GET: Listando a frota final para confirmar as mudanças
echo -e "\n[5] Executando GET para listar a frota final..." >> "$LOG_FILE"
curl -s -X GET "$API_URL" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Finalização do Log
echo -e "\n=========================================" >> "$LOG_FILE"
echo "Testes finalizados com sucesso!" >> "$LOG_FILE"

echo "Testes executados! Verifique o arquivo '$LOG_FILE' para ver os resultados."

========================================================================

EXERCICIOS AULA 04

Exercicio 01: 

Efetue uma requisicao GET buscando apenas o veiculo de ID 1 e exiba o resultado formatado com 'jq'. 

Comando: curl -s -X GET http://localhost:3001/api/v1/veiculos/1 | jq .id
Resposta: 1

Exercicio 02: 

Cadastre um novo caminhao da montadora 'Volvo' (modelo 'FH 540', placa 'KLL-9090') enviando uma requisicao POST via cURL ou httpie. Verifique se o retorno e o status HTTP 201 Created. 

Comando: curl -s -X POST http://localhost:3001/api/v1/veiculos \-H "Content-Type: application/json" \-d '{"placa":"KLL-9090","montadora":"Vol","modelo":"FH 540"}' | jq .
Resposta: 
{
  "id": 3,
  "placa": "KLL-9090",
  "montadora": "Volvo",
  "modelo": "FH 540",
  "status": "DISPONIVEL"
}

Exercicio 03: 

Tente cadastrar um veiculo sem passar o campo 'placa' no body da requisicao. Confirme se a API retorna o status 400 Bad Request com a mensagem de erro apropriada. 

Comando: curl -s -X POST http://localhost:3001/api/v1/veiculos \-H "Content-Type: application/json" \-d '{"montadora":"Volvo","modelo":"FH 540"}' | jq .
Resposta: 
{
  "erro": "Campos 'placa', 'montadora' e 'modelo' sao obrigatorio."
}

Exercicio 04: 

Faça uma requisicao GET filtrando os veiculos por query param: 'http://localhost:3000/api/v1/veiculos?status=DISPONIVEL&#39;. 

Comando: curl -s http://localhost:3001/api/v1/veiculos?status=DISPONIVEL&#39 | jq .
Resposta 01: [1] 4370
Resposta 02: [{"id":3,"placa":"VMX-5555","montadora":"Volkswagen","modelo":"Delivery","status":"DISPONIVEL"},{"id":3,"placa":"KLL-9090","montadora":
"Volvo","modelo":"FH 540","status":"DISPONIVEL"}]

Exercicio 05: 

Atualize o status do veiculo de ID 3 para 'EM_ROTA' utilizando a rota PATCH. 

Comando: curl -s -X PATCH http://localhost:3001/api/v1/veiculos/3/status \-H "Content-Type: application/json" \-d '{"status":"EM_ROTA"}' | jq .
Resposta: 
{
  "mensagem": "Status atualizado com sucesso!",
  "veiculo": {
    "id": 3,
    "placa": "VMX-5555",
    "montadora": "Volkswagen",
    "modelo": "Delivery",
    "status": "EM_ROTA"
  }
}

Exercicio 06: 

Tente atualizar ou deletar um veiculo com um ID inexistente (ex: ID 99) e valide se o status code retornado e 404 Not Found. 

Comando: curl -s -X DELETE http://localhost:3001/api/v1/veiculos/6767 | jq .
Resposta: 
{
  "erro": "Veiculo nao encontrado."
}

Exercicio 07: 

Adicione uma nova rota PUT na API (`/api/v1/veiculos/:id`) que permite substituir todos os dados de um veiculo de uma so vez. 

0.0.1 - frota_api.js (Coloque isso ao final do codigo)

// 6. PUT /api/v1/veiculos/:id - Substituir todos os dados de um veiculo
app.put('api/v1/veiculos/:id', (req, res) => {
        const id = parseInt(req.params.id);
        const index = veiculos.findIndex(v => v.id === id);

        if (index === -1) {
                return res.status(404).json({ erro: "Veiculo nao encontrado." });
        }
        const { placa, montadora, modelo, status } = req.body;

        if (!placa || !montadora || !modelo || !status) {
                return res.status(400).json({ erro: "Todos os campos (placa, montadora, modelo, status) sao obrigatorios para o PUT." });
        }
        veiculos[index] = {
                id, // Mantem o mesmo ID
                placa,
                montadora,
                modelo,
                status: status.toUpperCase()
        };

        res.status(200).json(veiculos[index]);
});

Exercicio 08: 

Crie um script Bash chamado 'teste_crud.sh' que executa sequencialmente o cadastro de 2 veiculos, atualiza 1 deles e deleta o outro, registrando os logs em 'crud_result.log'.

Criar o teste_crud.sh

Comando 01: chmod +x teste_crud.sh
Comando 02: ./teste_crud.sh
Resposta: Testes executados! Verifique o arquivo 'crud_result.log' para ver os resultados.

Comando 03: cat curd_results.log
Resposta:
=========================================
Iniciando testes CRUD - Fri Aug  7 12:48:32 AM UTC 2026
=========================================

[1] Executando POST para cadastrar Veículo 1 (Volvo FH540)...


[2] Executando POST para cadastrar Veículo 2 (Iveco Stralis)...


[3] Executando PUT para atualizar todos os dados do Veículo ID 3...


[4] Executando DELETE para remover o Veículo ID 4...


[5] Executando GET para listar a frota final...


=========================================
Testes finalizados com sucesso!
