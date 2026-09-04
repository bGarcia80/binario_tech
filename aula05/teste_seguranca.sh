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
