#!/bin/bash
echo "=========================================="
echo " AUDITORIA DE VALIDACAO E ERROS - AULA 13 "
echo "=========================================="

echo -e "\n[1] Teste 1: Envio de Payload INVALIDO (Esperado HTTP 442)..."
curl -s -X POST http://localhost:3000/api/v1/veiculos \ -H "Content-Type: application/json" \ -d '{ "placa": "ABC", "chassi": "123", "capacidadeCargaKg": 50 }' | jq .

echo -e "\n[2] Teste 2: Envio de Payload VALIDO (Esperado HTTP 201)..."
curl -s -X POST http://localhost:3000/api/v1/veiculos \ -H "Content-Type: application/json" \ -d '{ "placa": "ABC-1234", "chassi": "19BMSR450XYZ12345", "capacidadeCargaKg": 15000 }' | jq .

echo -e "\n[3] Teste 3: Simulação de Erro Interno do Servidor (Esperado HTTP 500)..."
curl -s -x POST http://localhost:3000/api/v1/veiculos \ -H "Content-Type: application/json" \ -d '{ "placa": "ABC-1234", "chassi": "ERRO_SIMULADO_500", "capacidadeCargaKg": 15000 }' | jq .

echo -e "\n[4] Teste 4: Rota Inexistente (Esperado HTTP 404)..."
curl -s http://localhost:3000/api/v1/rota-invalida | jq .
