
# Docker Setup Guide

## Pré-requisitos

- Docker Desktop instalado e executando
- Windows 10 Pro 22H2 ou superior
- 8GB RAM disponível (recomendado)
- 10GB espaço em disco livre

## Configuração Inicial

### 1. Clone o repositório
```bash
git clone <repository-url>
cd <project-name>
```

### 2. Configurar variáveis de ambiente (opcional)
Crie um arquivo `.env` na raiz do projeto se necessário:
```env
NODE_ENV=production
PORT=8080
```

## Comandos de Deploy

### Produção (Windows)
```cmd
# Usar script automatizado
deploy.bat

# Ou comandos manuais
docker-compose down
docker-compose up --build -d
```

### Desenvolvimento (Windows)
```cmd
# Usar script automatizado
dev.bat

# Ou comandos manuais
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build -d
```

### Linux/macOS
```bash
# Produção
chmod +x deploy.sh
./deploy.sh

# Desenvolvimento
chmod +x dev.sh
./dev.sh
```

## Persistência de Dados

### Volumes Docker
- **Produção**: `database_data` - persiste dados do banco SQLite
- **Desenvolvimento**: `database_data_dev` - dados separados para dev

### Backup dos Dados
```cmd
# Backup do volume de produção
docker run --rm -v database_data:/data -v %cd%:/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restaurar backup
docker run --rm -v database_data:/data -v %cd%:/backup alpine tar xzf /backup/backup.tar.gz -C /data .
```

## Monitoramento

### Verificar Status
```cmd
# Produção
docker-compose ps
docker-compose logs app

# Desenvolvimento
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.dev.yml logs app
```

### Health Checks
- **Produção**: http://localhost:8080/
- **Desenvolvimento**: http://localhost:5173/

## Solução de Problemas

### Container não inicia
1. Verificar se Docker Desktop está executando
2. Verificar logs: `docker-compose logs app`
3. Reiniciar Docker Desktop
4. Recriar containers: `docker-compose down -v && docker-compose up --build`

### Porta já em uso
```cmd
# Encontrar processo usando a porta
netstat -ano | findstr :8080
# Parar processo ou mudar porta no docker-compose.yml
```

### Problemas de permissão
- Executar prompt de comando como administrador
- Verificar se Docker Desktop tem permissões adequadas

### Performance lenta
- Aumentar recursos do Docker Desktop (Settings > Resources)
- Usar WSL2 backend se disponível
- Fechar aplicações desnecessárias

## Comandos Úteis

```cmd
# Parar todos os containers
docker-compose down

# Rebuild completo
docker-compose build --no-cache

# Ver logs em tempo real
docker-compose logs -f app

# Entrar no container
docker-compose exec app sh

# Limpar sistema Docker
docker system prune -a
```

## Estrutura dos Arquivos

```
.
├── Dockerfile              # Build de produção
├── Dockerfile.dev          # Build de desenvolvimento  
├── docker-compose.yml      # Configuração produção
├── docker-compose.dev.yml  # Configuração desenvolvimento
├── deploy.bat              # Script deploy Windows
├── dev.bat                 # Script dev Windows
├── deploy.sh               # Script deploy Linux/macOS
├── dev.sh                  # Script dev Linux/macOS
└── .dockerignore           # Arquivos ignorados no build
```

## Segurança

- Containers executam com usuário não-root
- Volumes isolados por ambiente
- Health checks configurados
- Limites de recursos definidos
- Firewall Windows configurado para portas necessárias

## Configurações de Rede

### Windows Firewall
```cmd
# Permitir acesso local na porta 8080
netsh advfirewall firewall add rule name="Docker-App" dir=in action=allow protocol=TCP localport=8080

# Permitir acesso local na porta 5173 (dev)
netsh advfirewall firewall add rule name="Docker-Dev" dir=in action=allow protocol=TCP localport=5173
```

### Acesso Remoto
Para permitir acesso de outras máquinas na rede:
```cmd
# Encontrar IP da máquina
ipconfig
# Acessar via http://IP_DA_MAQUINA:8080
```
