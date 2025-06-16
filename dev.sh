
#!/bin/bash
echo "========================================"
echo " Iniciando Ambiente de Desenvolvimento"
echo "========================================"

echo "Parando containers existentes..."
docker-compose -f docker-compose.dev.yml down

echo "Construindo imagem de desenvolvimento..."
docker-compose -f docker-compose.dev.yml build

echo "Iniciando aplicacao em modo desenvolvimento..."
docker-compose -f docker-compose.dev.yml up -d

echo "Aguardando inicializacao..."
sleep 30

echo "Verificando status da aplicacao..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "========================================"
echo " Desenvolvimento iniciado!"
echo " Aplicacao disponivel em: http://localhost:5173"
echo " Hot reload ativo"
echo "========================================"

echo "Exibindo logs da aplicacao..."
docker-compose -f docker-compose.dev.yml logs -f app
