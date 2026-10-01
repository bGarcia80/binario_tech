#!/bin/bash
echo "=================================================="
echo "    AUDITORIA DE PROCESSOS PM2 - BINÁRIO TECH"
echo "=================================================="

STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status')
RESTARTS=$(pm2 jlist | jq -r '.[0].pm2_env.restart_time')
PID=$(pm2 jlist | jq -r '.[0].pid')

echo "Status Atual: $STATUS"
echo "PID Ativo: $PID"
echo "Contador de Restarts: $RESTARTS"

if [ "$STATUS" == "online" ]; then
  echo -e "\n[OK] A aplicação está rodando normalmente!"
else
  echo -e "\n[ERRO] A aplicação está inativa! Tentando reiniciar..."
  pm2 restart api-telemetria
fi
echo "=================================================="
