#!/bin/bash

echo "[Binario Tech] Iniciando limpeza do ambiente de testes..."

# 1. Encerra qualquer processo do Node rodando o script atual (ou na porta 3000)
echo "Encerrando processos Node.js..."
fuser -k 3000/tcp

# 2. Exclui o arquivo de dados JSON se ele existir
ARQUIVO_DADOS="ocorrencias.json"

if [ -f "$ARQUIVO_DADOS" ]; then
    rm "$ARQUIVO_DADOS"
    echo "Arquivo '$ARQUIVO_DADOS' removido com sucesso."
else
    echo "Arquivo '$ARQUIVO_DADOS' nao encontrado."
fi

echo "[Binario Tech] Ambiente resetado com sucesso!"
