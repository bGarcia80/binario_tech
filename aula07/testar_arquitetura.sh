#!/bin/bash
echo "==============================================="
echo " TESTE INTEGRADO DE ARQUITETURA - BINARIO TECH "
echo "==============================================="

echo -e "\n[1] Consultando Telemetria Scania..."
curl -s http://localhost:3000/api/v1/telemetria/scania | jq .

echo -e "\n[2] Enviando Dado de Telemetria com Alerta de Temperatura..."
curl -s -X POST http://localhost:3000/api/v1/telemetria/scania \-H "Content-Type: application/json" \-d '{"modelo":"R540","vin":"9BS555444333","temperatura_motor":99}' | jq .

echo -e "\n[3] Testando Endpoint Inexistente (404)..."
curl -s http://localhost:3000/api/v1/telemetria/volvo | jq .
