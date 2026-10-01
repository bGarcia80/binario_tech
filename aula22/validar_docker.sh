#!/bin/bash
echo "=================================================="
echo "    AUDITORIA DE CONTAINER DOCKER - BINÁRIO TECH"
echo "=================================================="

CONTAINER_NAME="container-telemetria"
IS_RUNNING=$(docker inspect -f '{{.State.Running}}' "$CONTAINER_NAME" 2>/dev/null)

if [ "$IS_RUNNING" == "true" ]; then
  echo -e "[OK] Container '$CONTAINER_NAME' está ativo e em execução!"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/api/v1/container/info)
  echo "Status da resposta HTTP (Porta 8082): $HTTP_CODE"
else
  echo -e "[ERRO] Container '$CONTAINER_NAME' não está rodando."
fi
echo "=================================================="
