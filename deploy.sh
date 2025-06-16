
#!/bin/bash
echo "========================================"
echo " Iniciando Deploy de Producao"
echo "========================================"

echo "Parando containers existentes..."
docker-compose down

echo "Removendo imagens antigas..."
docker-compose build --no-cache

echo "Iniciando aplicacao em modo producao..."
docker-compose up -d

echo "Aguardando inicializacao..."
sleep 30

echo "Verificando status da aplicacao..."
docker-compose ps

echo ""
echo "========================================"
echo " Deploy concluido!"
echo " Aplicacao disponivel em: http://localhost:8080"
echo "========================================"

echo "Exibindo logs da aplicacao..."
docker-compose logs -f app
