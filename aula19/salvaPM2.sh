#!/bin/bash
echo "=============================================="
echo " PERSISTENCIA DE PROCESSOS PM2 - BINARIO TECH"
echo "=============================================="

LOG_FILE="processos_pm2.log"

TOTAL_PROCS=$(pm2 jlist | jq -r '. | length')
NOMES_PROCS=$(pm2 jlist | jq -r '..name' | paste -sd ", " -)

echo "Data da Operação: $(date '+%d/%m/%Y %H:%M:%S')"
echo "Total de Processos: $TOTAL_PROCS"
echo "Aplicações Mapeadas: ${NOMES_PROCS:-Nenhuma}"

pm2 list > "$LOG_FILE"
echo -e "\nOK! Lista de processos gravada no arquivo '$LOG_FILE'!"

echo -e "\nPersistindo configurações para o boot..."
if pm2 save; then
echo -e "\nOK! Configuração salva com sucesso para reinicialização do SO!"
else
echo -e "\nERRO! Falha ao executar 'pm2 save'!"
fi
echo "=================================================="
