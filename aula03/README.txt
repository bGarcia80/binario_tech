========================================================================
                        BINÁRIO TECH - AULA 03
                      Histórico de Versionamento
========================================================================

NOME: Bruno Rodrigues Garcia
E-MAIL: educacional - b.garcia@edu.senai.br

DESCRIÇÃO DO PROJETO: Inspecionar e filtrar respostas de APIs JSON via terminal e criar scripts em Bash (.sh) para testar rotas de telemetria automotiva (Scania, Mercedes-Benz, VW).

========================================================================

PRIMAIROS PASSOS:

1. Entrar
	- cd binario_tech
	- cd aula03

2. Baixar ferramentas e updates
	- npm init -y
	- npm install express
	- sudo apt-get update && sudo apt-get install -y jq httpie

3. Criar diretório de pastas (atualizado após resolução dos exercícios)
	aula03
	  |
	  |-> telemetria.js
	  |
	  |-> testar_telemetria.sh
	  |
	  |-> mercedes.json
	  |
	  |-> package.json
	  |
	  |-> relatorio.log

(Outros arquivos que vem após instalação e README.txt estão sendo ignorados)

========================================================================

VERSIONAMENTO:

---

0.0.0 - telemetria.js

Conteúdo:

const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Rota Scania
app.get('/api/v1/scania', (req, res) => {
    res.json({ montadora: "Scania", modelo: "R450", status: "OK", conexao: true, velocidade_media: 82 });
});

// Rota Mercedes-Benz
app.get('/api/v1/mercedes', (req, res) => {
    res.json({ montadora: "Mercedes-Benz", modelo: "Actros", status: "OK", conexao: true, velocidade_media: 78 });
});

// Rota Volkswagen
app.get('/api/v1/vw', (req, res) => {
    res.json({ montadora: "Volkswagen", modelo: "Delivery", status: "ALERTA", conexao: false, velocidade_media: 0 });
});

app.listen(PORT, () => {
    console.log(`[Binario Tech] Servidor de Telemetria rodando em http://localhost:${PORT}`);
});

Observação: Após a criação desse primeiro código se deve rodar o comando "node telemetria.js &"

---

0.0.0 - testar_telemetria.sh

Conteúdo:

#!/bin/bash
echo "========================================="
echo "  AUDITORIA DE TELEMETRIA - BINARIO TECH "
echo "  Data/Hora: $(date)"
echo "========================================="

echo -e "\n[1] Testando Rota Scania..."
curl -s http://localhost:3001/api/v1/scania | jq .

echo -e "\n[2] Testando Rota Mercedes-Benz..."
curl -s http://localhost:3001/api/v1/mercedes | jq .

echo -e "\n[3] Testando Rota Volkswagen..."
curl -s http://localhost:3001/api/v1/vw | jq .

echo -e "\n-----------------------------------------"
echo "Auditoria finalizada com sucesso!"

Observação: Para dar permissão e executar o código, é preciso rodar dois comando: 1 - "chmod +x testar_telemetria.sh" 2 - "./testar_telemetria.sh"

========================================================================

EXERCÍCIOS DA AULA 03

Exercicio 01:
Efetue uma requisicao GET para a rota '/api/v1/scania' via cURL e use o 'jq' para exibir somente a chave 'modelo'.

Comando: "curl -s http://localhost:3001/api/v1/scania | jq .modelo"
Resposta: "R450"

Exercicio 02:
Faça uma requisicao para a rota '/api/v1/mercedes' utilizando a ferramenta 'httpie' e salve o resultado no arquivo 'mercedes.json'.

Comando: "http http://localhost:3001/api/v1/mercedes | jq . >> mercedes.json" e "cat mercedes.json"
Reposta: 
{"montadora":"Mercedes-Benz","modelo":"Actros","status":"OK","conexao":true,"velocidade_media":78}{
  "montadora": "Mercedes-Benz",
  "modelo": "Actros",
  "status": "OK",
  "conexao": true,
  "velocidade_media": 78
}

(OBS: O cat aqui serve apenas para mostrar o conteúdo do arquivo mercedes.json)

Exercicio 03:
Utilize o 'jq' para ler o arquivo 'mercedes.json' e filtrar apenas o valor do campo 'status'.

Comando: jq .status mercedes.json
Resposta: "OK"
	  "OK"

Exercicio 04:
Edite o arquivo 'telemetria.js' e adicione uma nova rota '/api/v1/volvo' retornando os dados do modelo 'FH 540'. Reinicie a aplicacao e teste a rota.

0.0.1 - telemetria.js

const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Rota Scania
app.get('/api/v1/scania', (req, res) => {
    res.json({ montadora: "Scania", modelo: "R450", status: "OK", conexao: true, velocidade_media: 82 });
});

// Rota Mercedes-Benz
app.get('/api/v1/mercedes', (req, res) => {
    res.json({ montadora: "Mercedes-Benz", modelo: "Actros", status: "OK", conexao: true, velocidade_media: 78 });
});

// Rota Volkswagen
app.get('/api/v1/vw', (req, res) => {
    res.json({ montadora: "Volkswagen", modelo: "Delivery", status: "ALERTA", conexao: false, velocidade_media: 0 });
});

// Rota Volvo
app.get('/api/v1/volvo', (req, res) => {
    res.json({ montadora: "Volvo", modelo: "FH 540", status: "ativo" });
});

app.listen(PORT, () => {
    console.log(`[Binario Tech] Servidor de Telemetria rodando em http://localhost:${PORT}`);
});

Comando 01: "fuser -k 3001/tcp"
Resposta: "[3] 2873"
	  "[2]   Killed                  node telemetria.js"

Comando 02: "node telemetria.js &"
Resposta: "[Binario Tech] Servidor de Telemetria rodando em http://localhost:3001"
	  "[4]+  Done                    node telemetria.js"

Comando 03: "curl -s http://localhost:3001/api/v1/volvo | jq ."
Resposta: 
"{
  "montadora": "Volvo",
  "modelo": "FH 540",
  "status": "ativo"
}"

Exercicio 05:
Configure o arquivo 'package.json' adicionando um script "start": "node telemetria.js". Teste a execucao usando 'npm start'.

0.0.0 - package.json

{
  "name": "aula03",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node telemetria.js"
  },
  "keywords": [],
  "type": "commonjs",
  "dependencies": {
    "express": "^5.2.1"
  }
}

Comando: "npm start"
Resposta: 
"npm notice run aula03@1.0.0 start
npm notice run node telemetria.js
[Binario Tech] Servidor de Telemetria rodando em http://localhost:3001"

Exercicio 06:
Crie um comando que direcione o resultado da auditoria do script 'testar_telemetria.sh' para um arquivo de log chamado 'relatorio.log'.

Comando: "./testar_telemetria.sh >> relatorio.log" e "cat relatorio.log"
Resposta:
"================================================================
AUDITORIA DE TELEMETRIA - BINARIO TECH
Data/Hora: Fri Jul 31 11:34:07 PM UTC 2026
================================================================

[1] Testando Rota Scania...
{
  "montadora": "Scania",
  "modelo": "R450",
  "status": "OK",
  "conexao": true,
  "velocidade_media": 82
}

[2] Testando Rota Mercedes-Benz...
{
  "montadora": "Mercedes-Benz",
  "modelo": "Actros",
  "status": "OK",
  "conexao": true,
  "velocidade_media": 78
}

[3] Testando Rota Volkswagen...
{
  "montadora": "Volkswagen",
  "modelo": "Delivery",
  "status": "ALERTA",
  "conexao": false,
  "velocidade_media": 0
}

[4] Testando Rota Volvo...
{
  "montadora": "Volvo",
  "modelo": "FH 540",
  "status": "ativo"
}

----------------------------------------
Auditoria finalizada com sucesso!"

(OBS: O cat aqui serve apenas para mostrar o conteúdo do arquivo relatorio.log)

Exercicio 07:
Filtre a resposta da rota '/api/v1/vw' para exibir apenas os campos 'montadora' e 'status' em uma unica chamada 'jq'.

Comando: "curl -s http://localhost:3001/api/v1/vw | jq '{montadora: .montadora, status: .status}'"
Resposta: 
"{
  "montadora": "Volkswagen",
  "status": "ALERTA"
}"

Exercicio 08:
Localize o PID do processo Node.js em execucao no seu terminal usando 'ps aux | grep node' e encerre-o com o comando 'kill -9 <PID>'.

Comando 01: "ps aux | grep node"
Resposta: "root       668  0.0  0.0   9196  4000 ?.... ana_l_p+  2873  0.0  0.8 1417560 69840 pts/2   S<1  13:52   0:00 node telemetria.js ...."
 (OBS: Aqui é preciso pegar o número da segunda linha ou a linha que está listado o processo node)

Comando 02: "kill -9 2873"
Resposta: "[3]+  Killed                  node telemetria.js"

========================================================================
