#!/bin/bash
echo "======================================"
echo " AUDITORIA DE VALIDAÇÃO JWT - AULA 14"
echo "======================================"

echo -e "\n[1] Registrando novo Usuário Operador..."
curl -s -X POST http://localhost:3004/api/v1/prova/register \
	-H "Content-Type: application/json" \
	-d '{ "email": "operador@binariotech.com.br", "senha": "SenhaSegura123!", "perfil": "ADMIN" }' | jq .

echo -e "\n[2] Realizando Login e Obtendo JWT..."
LOGIN_RESP=$(curl -s -X POST http://localhost:3004/api/v1/prova/login \
	-H "Content-Type: application/json" \
	-d '{ "email": "operador@binariotech.com.br", "senha": "SenhaSegura123!" }')

echo $LOGIN_RESP | jq .

TOKEN=$(echo $LOGIN_RESP | jq -r '.token')

echo -e "\n[3] Tentando acessar Rota Protegida SEM Token (Esperado HTTP 401)..."
curl -s http://localhost:3004/api/v1/prova/perfil | jq .

echo -e "\n[4] Acessando Rota Protegida COM Token JWT Válido (Esperado HTTP 200)..."
curl -s http://localhost:3004/api/v1/prova/perfil \
	-H "Authorization: Bearer $TOKEN" | jq .
