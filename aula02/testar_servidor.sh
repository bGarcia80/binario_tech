#!/bin/bash
echo "=========================================="
echo "  AUDITORIA DE SERVIDOR   - BINARIO TECH  "
echo "  Data/Hora: $(date)                      "
echo "=========================================="

echo -e "\n[1] Testando Rota de Status..."
curl -s http://localhost:3000/status | jq .

echo -e "\n[2] Testando Rota Scania..."
curl -s http://localhost:3000/scania/info | jq .

echo -e "\n[3] Testando Rota Volkswagen..."
curl -s http://localhost:3000/vw/info | jq .

echo -e "\n---------------------------------------"
echo "Auditoria finalizada com sucesso!"
