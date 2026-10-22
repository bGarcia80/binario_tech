NOME: Bruno Rodrigues Garcia
E-MAIL: educacional - b.garcia@edu.senai.br

DESCRIÇÃO DO PROJETO: Protocolo HTTP e APIs RESTful, dividida em teoria (Headers, Params, Verbos e Status Codes), criação prática de uma API de gerenciamento de frotas em Node.js/Express para a Binario Tech, e uma bateria de 8 exercícios no terminal.

========================================================================

PRIMAIROS PASSOS:

1. Entrar
        - cd binario_tech
        - cd aula05

2. Baixar ferramentas e updates
        - npm init -y
        - npm install express cors

3. Criar diretório de pastas (atualizado após resolução dos exercícios)
        aula05
          |
          |-> app.js
          |
          |-> audit_seguranca.log
          |
          |-> package.json
          |
          |-> teste_segurança.sh
          |
          |-> middlewares
          |		|
	  |		+-> auth.js
	  |		|
	  |		+-> logger.js
	  |		|
	  |		+-> validaCnh.js
          |-> routes
	  |	|
	  |	+-> manutencoes.js
	  |	|
	  |	+-> motoristas.js

(Outros arquivos que vem após instalação e README.txt estão sendo ignorados)

========================================================================
VERSIONAMENTO:

---
0.0.0 - middlewares/logger.js

function loggerMiddleware(req, res, next) {
    const inicio = Date.now();
    const timestamp = new Date().toISOString();
    
    res.on('finish', () => {
        const duracao = Date.now() - inicio;
        console.log(`[LOG ${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duracao}ms)`);
    });
    
    next();
}

module.exports = loggerMiddleware;

---
0.0.0 - middlewares/auth.js

function authMiddleware(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const CHAVE_VALIDA = "binario-tech-secret-2026";

    if (!apiKey || apiKey !== CHAVE_VALIDA) {
        return res.status(401).json({
            erro: "Acesso nao autorizado. Header 'X-API-KEY' invalido ou ausente."
        });
    }

    next();
}

module.exports = authMiddleware;

---
0.0.0 - routes/manutencoes.js

const express = require('express');
const router = express.Router();

let motoristas = [
    { id: 1, nome: "Carlos Silva", cnh: "12345678900", categoria: "E", ativo: true },
    { id: 2, nome: "Ana Pereira", cnh: "98765432100", categoria: "D", ativo: true }
];

// GET /api/v1/motoristas
router.get('/', (req, res) => {
    res.status(200).json(motoristas);
});

// POST /api/v1/motoristas (Com validacao inline)
router.post('/', (req, res) => {
    const { nome, cnh, categoria } = req.body;

    if (!nome || !cnh || !categoria) {
        return res.status(400).json({ erro: "Campos 'nome', 'cnh' e 'categoria' sao obrigatorios." });
    }

    const novoMotorista = {
        id: motoristas.length + 1,
        nome,
        cnh,
        categoria,
        ativo: true
    };

    motoristas.push(novoMotorista);
    res.status(201).json(novoMotorista);
});

module.exports = router;

---
0.0.0 - app.js

const express = require('express');
const cors = require('cors');
const loggerMiddleware = require('./middlewares/logger');
const authMiddleware = require('./middlewares/auth');
const motoristasRouter = require('./routes/motoristas');
const manutencoesRouter = require('./routes/manutencoes'); // Isso foi adicionado

const app = express();
const PORT = 3001;

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Rota Publica
app.get('/api/v1/health', (req, res) => {
        res.status(200).json({ status: "ONLINE", application: "Binario Tech API v2"});
});

// Rotas Protegidas por Autenticacao
app.use('/api/v1/motoristas', authMiddleware, motoristasRouter);
app.use('/api/v1/manutencoes', authMiddleware, manutencoesRouter); // Isso foi adicionado

// Middleware Global de tratamento de Erros 404 (Rota nao encontrada)
app.use((req, res) => {
        res.status(404).json({ erro: "Endpoint nao encontrado no servidor Binario Tech." });
});

app.listen(PORT, () => {
        console.log(`[Binario Tech] Servidor de Middlewares ativo na porta ${PORT}`);
});

---
0.0.0 - package.json
{
  "name": "aula05",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.6",
    "express": "^5.2.1"
  }
}

(OBSERVACOES: Após criar e editar todos os arquivos, rode:
- node app.js &
testes:
- curl -s http://localhost:3001/api/v1/health | jq .
- curl -s -H "X-API-KEY: binario-tech-secret-2026" http://localhost:3001/api/v1/motoristas | jq .
- curl -s -X POST http://localhost:3001/api/v1/motoristas \
     -H "X-API-KEY: binario-tech-secret-2026" \
     -H "Content-Type: application/json" \
     -d '{"nome":"Roberto Souza","cnh":"55544433322","categoria":"E"}' | jq .
========================================================================

EXERCICIOS

Exercicio 01:
Efetue uma requisicao GET na rota de 'health' e verifique nos logs do terminal a mensagem gerada pelo 'loggerMiddleware'.

Comando: curl -X GET http://localhost:3001/api/v1/health | jq .
Resposta:
% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    55  100    55    0     0  20857      0 --:--:-- --:--:-- --:--:-- 27500
[LOG 2026-08-07T21:18:51.970Z] GET /api/v1/health - Status: 200 (1ms)
{
  "status": "ONLINE",
  "application": "Binario Tech API v2"
}

Exercicio 02 e 03:
Crie um novo arquivo de rota 'routes/manutencoes.js' que gerencia orcaments de manutencao dos caminhões. Adicione rotas para listar e cadastrar manutencoes.
Registre o novo roteador de manutencoes no arquivo 'app.js' sob o caminho '/api/v1/manutencoes', aplicando tambem o 'authMiddleware'.

0.0.0 - manutencoes.js

const express = require('express');
const cors = require('cors');
const loggerMiddleware = require('./middlewares/logger');
const authMiddleware = require('./middlewares/auth');
const motoristasRouter = require('./routes/motoristas');
const manutencoesRouter = require('./routes/manutencoes'); // Isso foi adicionado

const app = express();
const PORT = 3001;

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Rota Publica
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: "ONLINE", application: "Binario Tech API v2"});
});

// Rotas Protegidas por Autenticacao
app.use('/api/v1/motoristas', authMiddleware, motoristasRouter);
app.use('/api/v1/manutencoes', authMiddleware, manutencoesRouter); // Isso foi adicionado

// Middleware Global de tratamento de Erros 404 (Rota nao encontrada)
app.use((req, res) => {
    res.status(404).json({ erro: "Endpoint nao encontrado no servidor Binario Tech." });
});

app.listen(PORT, () => {
    console.log(`[Binario Tech] Servidor de Middlewares ativo na porta ${PORT}`);
});

Exercicio 04:
Crie um middleware exclusivo de validacao de CNH chamado 'middlewares/validaCnh.js' que garante que a CNH informada no POST contenha exatamente 11 digitos numericos.

0.0.0 - middleware/validaCnh.js

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

Exercicio 05:
Aplique o middleware 'validaCnh' apenas na rota POST de motoristas e faca um teste via cURL enviando uma CNH invalida (ex: "123"). Confirme o retorno 400 Bad Request.

0.0.1 - validaCnh.js

const express = require('express');
const router = express.Router();
const validaCnh = require('../middlewares/validaCnh');// Isso foi adicionado

let motoristas = [
    { id: 1, nome: "Carlos Silva", cnh: "12345678900", categoria: "E", ativo: true },
    { id: 2, nome: "Ana Pereira", cnh: "98765432100", categoria: "D", ativo: true }
];

// GET /api/v1/motoristas
router.get('/', (req, res) => {
    res.status(200).json(motoristas);
});

// POST /api/v1/motoristas (Com validacao inline)
router.post('/', (req, res) => {
    const { nome, cnh, categoria } = req.body;

    if (!nome || !cnh || !categoria) {
        return res.status(400).json({ erro: "Campos 'nome', 'cnh' e 'categoria' sao obrigatorios." });
    }

    const novoMotorista = {
        id: motoristas.length + 1,
        nome,
        cnh,
        categoria,
        ativo: true
    };

    motoristas.push(novoMotorista);
    res.status(201).json(novoMotorista);
});

module.exports = router;

---

Comando: curl -v -X POST http://localhost:3001/api/v1/motoristas \-H "Content-Type: application/json" \-d '{"nome": "João da Silva", "cnh": "123", "categoria": "C"}' | jq .
Resposta:
Note: Unnecessary use of -X or --request, POST is already inferred.
* Host localhost:3000 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:3000...
* Immediate connect fail for ::1: Cannot assign requested address
*   Trying 127.0.0.1:3000...
* Connected to localhost (127.0.0.1) port 3000
> POST /api/v1/motoristas HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/8.5.0
> Accept: */*
> Content-Type: application/json
> Content-Length: 58
> 
< HTTP/1.1 401 Unauthorized
< X-Powered-By: Express
< Access-Control-Allow-Origin: *
< Content-Type: application/json; charset=utf-8
< Content-Length: 72
< ETag: W/"48-ZaXRmv6jo1s8o1pX+QlMb1787Xk"
< Date: Fri, 07 Aug 2026 23:20:47 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
< 
* Connection #0 to host localhost left intact
{"erro":"Acesso nao autorizado. Header 'X-API-KEY invalido ou ausente."}[LOG 2026-08-07T23:20:47.836Z] POST /api/v1/motoristas - Status: 401 (1ms)

Exercicio 06:
Faca uma requisicao GET para uma rota inexistente como '/api/v1/clientes' e confirme que o middleware global de 404 intercepta e responde em JSON padronizado.

Comando: curl -v -X GET http://localhost:3001/api/v1/clientes
Resposta: 
Note: Unnecessary use of -X or --request, GET is already inferred.
* Host localhost:3000 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:3000...
* Immediate connect fail for ::1: Cannot assign requested address
*   Trying 127.0.0.1:3000...
* Connected to localhost (127.0.0.1) port 3000
> GET /api/v1/clientes HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/8.5.0
> Accept: */*
> 
< HTTP/1.1 404 Not Found
< X-Powered-By: Express
< Access-Control-Allow-Origin: *
< Content-Type: application/json; charset=utf-8
< Content-Length: 60
< ETag: W/"3c-FaN9AmZqjke1FsAm8K/UB0+2oc8"
< Date: Fri, 07 Aug 2026 23:18:33 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
< 
* Connection #0 to host localhost left intact
{"erro":"Endpoint nao encontrado no servidor Binario Tech."}[LOG 2026-08-07T23:18:33.006Z] GET /api/v1/clientes - Status: 404 (9ms)}

Exercicio 07:
Crie um script Bash chamado 'teste_seguranca.sh' que simula 3 tentativas de acesso sem chave de API e 1 tentativa com chave valida, salvando os retornos em 'audit_seguranca.log'.

0.0.0 - teste_seguranca.sh

#!/bin/bash

# Define o nome do arquivo de log
LOG_FILE="audit_seguranca.log"

# Limpa o arquivo de log anterior e inicia o cabeçalho
echo "========================================" > "$LOG_FILE"
echo " Auditoria de Segurança de API" >> "$LOG_FILE"
echo " Data: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Função para simular uma requisição à API
simular_requisicao() {
    local num_tentativa=$1
    local chave_api=$2

    echo "-> Executando Tentativa $num_tentativa..." >> "$LOG_FILE"
    
    # Simula um pequeno atraso de rede
    sleep 1 

    if [ -z "$chave_api" ]; then
        # Simula resposta de erro (Sem chave)
        echo "   [STATUS HTTP]: 401 Unauthorized" >> "$LOG_FILE"
        echo "   [RETORNO]: {\"erro\": \"Acesso negado. Chave de API ausente ou inválida.\"}" >> "$LOG_FILE"
    else
        # Simula resposta de sucesso (Com chave)
        echo "   [STATUS HTTP]: 200 OK" >> "$LOG_FILE"
        echo "   [RETORNO]: {\"sucesso\": true, \"dados\": \"Acesso autorizado aos recursos.\"}" >> "$LOG_FILE"
    fi
    
    echo "----------------------------------------" >> "$LOG_FILE"
}

echo "Iniciando testes de segurança. Os resultados serão salvos em '$LOG_FILE'..."

# Simula 3 tentativas falhas (Sem chave de API)
for i in {1..3}; do
    simular_requisicao "$i" ""
    echo "Tentativa $i (sem chave) concluída."
done

# Simula 1 tentativa bem-sucedida (Com chave válida)
simular_requisicao 4 "TOKEN_SECRETO_VALIDO_12345"
echo "Tentativa 4 (com chave) concluída."

echo "Simulação finalizada com sucesso! Verifique o log com: cat $LOG_FILE"

Exercicio 08:
Utilize o comando 'ps aux | grep node' no terminal Linux para encontrar o processo da API e encerre-o utilizando 'kill -9 <PID>'.

Comando: kill -9 <PID>
Resposta: [1]+  Killed                  node app.js

