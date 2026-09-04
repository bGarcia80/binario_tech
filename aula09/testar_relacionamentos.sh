#!/bin/bash
echo "===================================================="
echo " AUDITORIA DE RELACIONAMENTOS (JOIN) - BINÁRIO TECH "
echo "===================================================="

echo -e "\n[1] Cadastrando Veículo Scania..."
curl -s -X POST http://localhost:3000/api/v1/telemetria/veiculo-teste \-H "Content-Type: application/json" \-d '{"placa":"SCA-9900","montadora":"Scania","modelo":"R450"}' | jq .

echo -e "\n[2] Cadastrando Leitura de Telemetria vinculada ao Veículo ID 1..."
curl -s -X POST http://localhost:3000/api/v1/telemetria \-H "Content-Type: application/json" \-d '{"veiculo_id":1,"velocidade":88.5,"temperatura_motor":92.0}' | jq .

echo -e "\n[3] Consultadno Relatório Agregado (INNER JOIN)..."
curl -s http://localhost:3000/api/v1/telemetria/relatorio | jq .
