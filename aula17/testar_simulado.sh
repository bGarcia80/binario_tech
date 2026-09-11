#!/bin/bash
echo "===================================================="
echo "       AUDITORIA E TESTES - BINÁRIO TECH          "
echo "===================================================="

LOG_FILE="health_check.log"
URL_HEALTH="http://127.0.0.1:3004/api/v1/health"

echo -e "\n[1] Executando requisição GET na rota /api/v1/health..."

# Captura o HTTP Status Code e grava diretamente no arquivo
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL_HEALTH")
echo "$STATUS_CODE" > "$LOG_FILE"

echo -e "[OK] HTTP Status Code ($STATUS_CODE) gravado em '$LOG_FILE'."
