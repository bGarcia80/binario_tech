#!/bin/bash

LOG_FILE="auditoria.log"
BASE_URL="http://localhost:3000/api/v1/telemetria"

# Inicializa/Sobrescreve o arquivo de log com o cabeçalho
echo "====================================================" > "$LOG_FILE"
echo "        AUDITORIA DE TELEMETRIA - BINÁRIO TECH      " >> "$LOG_FILE"
echo "Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "====================================================" >> "$LOG_FILE"

executar_requisicao() {
    local descricao="$1"
    local metodo="$2"
    local url="$3"
    local payload="$4"

    echo -e "\n----------------------------------------------------" >> "$LOG_FILE"
    echo "[TESTE]: $descricao" >> "$LOG_FILE"
    echo "Endpoint: $metodo $url" >> "$LOG_FILE"
    echo "Resposta:" >> "$LOG_FILE"

    if [ "$metodo" = "GET" ]; then
        curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$url" >> "$LOG_FILE"
    elif [ "$metodo" = "POST" ]; then
        curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$url" \-H "Content-Type: application/json" \-d "$payload" >> "$LOG_FILE"
    fi
}

# 1. Rotas Scania
executar_requisicao "Listar Telemetria - Scania" "GET" "$BASE_URL/scania"
executar_requisicao "Registrar Telemetria - Scania (Válido)" "POST" "$BASE_URL/scania" \
  '{"modelo": "R500", "vin": "9BS111222333", "temperatura_motor": 90}'

# 2. Rotas Mercedes-Benz
executar_requisicao "Listar Telemetria - Mercedes-Benz" "GET" "$BASE_URL/mercedes"
executar_requisicao "Registrar Telemetria - Mercedes-Benz (Válido)" "POST" "$BASE_URL/mercedes" \
  '{"modelo": "Actros 2548", "vin": "9BM444555666", "temperatura_motor": 92}'

# 3. Teste de Validação / Erro
executar_requisicao "Teste de VIN Inválido (Middleware)" "POST" "$BASE_URL/scania" \
  '{"modelo": "R450", "vin": "INVALIDO", "temperatura_motor": 88}'

echo -e "\n====================================================" >> "$LOG_FILE"
echo "Auditoria concluída com sucesso." >> "$LOG_FILE"
