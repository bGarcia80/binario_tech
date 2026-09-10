echo "======================================"
echo " AUDITORIA DE SERVIDOR - BINARIO TECH "
echo "======================================"

echo "Listando os processos de Node.js ativos no servidor e enviando para o arquivo..."
ps aux | grep node >> ./processos.log

	echo "Veja o resultado com o comando 'cat processos.log'..."
