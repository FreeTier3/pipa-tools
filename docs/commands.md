
# Docker Commands Reference

## Development Commands

### Start Development Environment
```cmd
# Windows batch file
dev.bat

# Manual start
docker-compose -f docker-compose.dev.yml up --build

# Background mode
docker-compose -f docker-compose.dev.yml up -d --build
```

### Development Management
```cmd
# View development logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Restart development container
docker-compose -f docker-compose.dev.yml restart app

# Rebuild development container
docker-compose -f docker-compose.dev.yml build --no-cache app
```

## Production Commands

### Start Production Environment
```cmd
# Windows batch file
deploy.bat

# Manual start
docker-compose up --build

# Background mode
docker-compose up -d --build
```

### Production Management
```cmd
# View production logs
docker-compose logs -f app

# Stop production environment
docker-compose down

# Restart production container
docker-compose restart app

# Rebuild production container
docker-compose build --no-cache app
```

## Container Management

### Container Information
```cmd
# List running containers
docker-compose ps

# Show container details
docker-compose exec app sh

# Container resource usage
docker stats

# Container processes
docker-compose exec app ps aux
```

### Container Logs
```cmd
# Follow logs in real-time
docker-compose logs -f app

# Show last 100 lines
docker-compose logs --tail 100 app

# Show logs since specific time
docker-compose logs --since "2024-01-01T00:00:00" app

# Show logs for specific time range
docker-compose logs --since "1h" app
```

## Volume and Data Management

### Volume Operations
```cmd
# List volumes
docker volume ls

# Inspect volume
docker volume inspect database_data

# Remove specific volume (⚠️ destroys data)
docker volume rm database_data

# Remove all unused volumes (⚠️ destroys data)
docker volume prune
```

### Database Access
```cmd
# Access database directory
docker-compose exec app ls -la /app/database

# Copy file from container
docker cp container_name:/app/database/db.sqlite ./backup.sqlite

# Copy file to container
docker cp ./backup.sqlite container_name:/app/database/db.sqlite
```

## Image Management

### Image Operations
```cmd
# List images
docker images

# Remove specific image
docker rmi image_name

# Remove unused images
docker image prune

# Remove all images (⚠️ forces rebuild)
docker image prune -a
```

### Build Operations
```cmd
# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build app

# Build with custom Dockerfile
docker build -f Dockerfile.custom .
```

## Network Management

### Network Information
```cmd
# List networks
docker network ls

# Inspect network
docker network inspect bridge

# Show container network details
docker-compose exec app ip addr show
```

### Port Management
```cmd
# Check port usage
netstat -an | findstr :8080

# Test connectivity
curl http://localhost:8080
telnet localhost 8080

# PowerShell alternative
Test-NetConnection -ComputerName localhost -Port 8080
```

## System Maintenance

### Cleanup Commands
```cmd
# Remove stopped containers
docker container prune

# Remove unused networks
docker network prune

# Remove build cache
docker builder prune

# Complete system cleanup (⚠️ removes everything unused)
docker system prune -a --volumes
```

### Health Checks
```cmd
# Manual health check
curl -f http://localhost:8080/ || echo "Health check failed"

# Container health status
docker inspect --format='{{.State.Health.Status}}' container_name

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' container_name
```

## Development Utilities

### File Watching
```cmd
# Check file watching status
docker-compose exec app env | grep CHOKIDAR

# Force file watching (if hot reload isn't working)
docker-compose -f docker-compose.dev.yml restart app
```

### Package Management
```cmd
# Install new package
docker-compose exec app npm install package-name

# Update packages
docker-compose exec app npm update

# Clear npm cache
docker-compose exec app npm cache clean --force
```

## Debugging Commands

### Container Debugging
```cmd
# Enter container shell
docker-compose exec app sh

# Run commands in container
docker-compose exec app npm run build
docker-compose exec app npm test

# Check container environment
docker-compose exec app env
```

### Process Monitoring
```cmd
# Monitor container processes
docker-compose exec app top

# Check container resource limits
docker inspect container_name | grep -i memory
docker inspect container_name | grep -i cpu
```

## Backup and Restore

### Quick Backup
```cmd
# Create backup (Windows)
docker run --rm -v database_data:/data -v %cd%:/backup alpine tar czf /backup/backup-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%.tar.gz -C /data .

# Create backup (PowerShell)
$date = Get-Date -Format "yyyyMMdd-HHmm"
docker run --rm -v database_data:/data -v ${PWD}:/backup alpine tar czf /backup/backup-$date.tar.gz -C /data .
```

### Quick Restore
```cmd
# Restore backup (replace filename)
docker run --rm -v database_data:/data -v %cd%:/backup alpine tar xzf /backup/backup-YYYYMMDD-HHMM.tar.gz -C /data .
```

## Environment-Specific Commands

### Development Only
```cmd
# Hot reload restart
docker-compose -f docker-compose.dev.yml restart app

# Development with different port
docker-compose -f docker-compose.dev.yml -p dev up --build
```

### Production Only
```cmd
# Production with resource limits
docker-compose up --build --scale app=1

# Production health monitoring
docker-compose exec app curl -f http://localhost:8080/health
```

## Common Command Combinations

### Complete Environment Reset
```cmd
docker-compose down -v
docker system prune -f
docker-compose up --build -d
```

### Quick Status Check
```cmd
docker-compose ps && docker-compose logs --tail 10 app
```

### Performance Check
```cmd
docker stats --no-stream && docker system df
```
