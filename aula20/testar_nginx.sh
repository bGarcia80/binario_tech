#!/bin/bash
echo "=================================================="
echo "    AUDITORIA DE PROXY REVERSO NGINX - BINÁRIO TECH"
echo "=================================================="

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/proxy/info)

echo "Testando acesso via Nginx na porta 8080..."
echo "HTTP Status Code: $HTTP_CODE"

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "\n[OK] Proxy Reverso Nginx encaminhando tráfego com sucesso!"
else
  echo -e "\n[ERRO] Falha no redirecionamento. Verifique se o PM2 e o Nginx estão ativos."
fi
echo "=================================================="
