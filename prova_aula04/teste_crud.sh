#!/bin/bash

API_URL="http://localhost:3000/api/v1/veiculos"
LOG_FILE="crud_result.log"

# Limpa o arquivo de log caso ele já exista e insere o cabeçalho
echo "=========================================" > "$LOG_FILE"
echo "Iniciando testes CRUD - $(date)" >> "$LOG_FILE"
echo "=========================================" >> "$LOG_FILE"

# 1. CREATE: Cadastrando o primeiro veículo (ID 3)
echo -e "\n[1] Executando POST para cadastrar Veículo 1 (Volvo FH540)..." >> "$LOG_FILE"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"placa": "DEF-5678", "montadora": "Volvo", "modelo": "FH540"}' | jq .>> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 2. CREATE: Cadastrando o segundo veículo (ID 4)
echo -e "\n[2] Executando POST para cadastrar Veículo 2 (Iveco Stralis)..." >> "$LOG_FILE"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"placa": "GHI-9012", "montadora": "Iveco", "modelo": "Stralis"}' | jq . >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 3. UPDATE: Atualizando todos os dados do veículo criado no passo 1 (ID 3) usando o novo PUT
echo -e "\n[3] Executando PUT para atualizar todos os dados do Veículo ID 3..." >> "$LOG_FILE"
curl -s -X PUT "$API_URL/3" \
  -H "Content-Type: application/json" \
  -d '{"placa": "DEF-5678", "montadora": "Volvo", "modelo": "FH540", "status": "EM MANUTENCAO"}' | jq . >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 4. DELETE: Deletando o veículo criado no passo 2 (ID 4)
echo -e "\n[4] Executando DELETE para remover o Veículo ID 4..." >> "$LOG_FILE"
curl -s -X DELETE "$API_URL/4" | jq . >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 5. GET: Listando a frota final para confirmar as mudanças
echo -e "\n[5] Executando GET para listar a frota final..." >> "$LOG_FILE"
curl -s -X GET "$API_URL" | jq . >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Finalização do Log
echo -e "\n=========================================" >> "$LOG_FILE"
echo "Testes finalizados com sucesso!" >> "$LOG_FILE"

echo "Testes executados! Verifique o arquivo '$LOG_FILE' para ver os resultados."
