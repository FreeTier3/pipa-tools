
# Troubleshooting Guide

## Docker Desktop Issues

### Docker Desktop Won't Start
```cmd
# Check Docker service status
sc query com.docker.service

# Restart Docker services
net stop com.docker.service
net start com.docker.service

# Alternative: Restart via Docker Desktop interface
```

### WSL2 Problems
```cmd
# Check WSL2 installation
wsl --list --verbose

# Update WSL2
wsl --update

# Reset WSL2 if needed
wsl --unregister Ubuntu
wsl --install -d Ubuntu
```

## Container Issues

### Container Won't Start
1. Check if Docker Desktop is running
2. Review logs: `docker-compose logs app`
3. Restart Docker Desktop
4. Reboot VM if necessary

### Application Not Responding
```cmd
# Check if port 8080 is free
netstat -an | findstr :8080

# Test connectivity
curl http://localhost:8080
# If curl unavailable:
powershell -Command "Invoke-WebRequest -Uri http://localhost:8080"

# Check container status
docker-compose ps
```

### Permission Errors
```cmd
# Run command prompt as administrator
# Ensure Docker Desktop is running

# Recreate database volume
docker-compose down -v
docker-compose up --build
```

## Performance Issues

### Slow Performance
1. **Increase VM Resources**:
   - More CPU cores (6-8 recommended)
   - More RAM (12-16GB recommended)
   - Use SSD storage

2. **Enable WSL2**:
   - Better performance than Hyper-V backend
   - Follow WSL2 setup instructions

3. **Clean Resources**:
   ```cmd
   docker system prune -a
   docker volume prune
   ```

### High Memory Usage
```cmd
# Check Docker resource usage
docker stats

# Limit container memory in docker-compose.yml
# Already configured in current setup
```

## Network Issues

### Port Already in Use
```cmd
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Firewall Blocking Access
```cmd
# Check Windows Firewall
# Control Panel > System and Security > Windows Defender Firewall

# Add rule for port 8080
netsh advfirewall firewall add rule name="Docker-8080" dir=in action=allow protocol=TCP localport=8080
```

### VPN Conflicts
- Some VPNs interfere with Docker networking
- Try disconnecting VPN temporarily
- Configure VPN to exclude Docker networks

## Build Issues

### Build Failures
```cmd
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check for disk space
docker system df
```

### Dependency Issues
```cmd
# Clear npm cache in container
docker-compose exec app npm cache clean --force

# Remove node_modules and reinstall
docker-compose down
docker-compose up --build
```

## Common Error Messages

### "Docker daemon not running"
1. Start Docker Desktop
2. Wait for complete initialization
3. Check system tray for Docker icon

### "Port 8080 is already allocated"
```cmd
# Stop existing containers
docker-compose down

# Find and stop conflicting services
netstat -ano | findstr :8080
```

### "Volume mount failed"
1. Ensure source directory exists
2. Check Docker Desktop volume sharing settings
3. Restart Docker Desktop

### "Health check failed"
```cmd
# Check application logs
docker-compose logs app

# Manually test health endpoint
curl http://localhost:8080/

# Restart container
docker-compose restart app
```

## System Diagnostics

### Collect System Information
```cmd
# Windows version
winver

# System information
systeminfo

# Docker information
docker system info
docker version

# Container status
docker-compose ps

# Resource usage
docker stats --no-stream
```

### Log Files Location
- **Docker Desktop logs**: `%APPDATA%\Docker\log.txt`
- **Container logs**: `docker-compose logs app`
- **Windows Event Viewer**: Windows Logs > Application

## Recovery Procedures

### Complete Reset
```cmd
# Stop all containers
docker-compose down

# Remove all containers and volumes
docker system prune -a --volumes

# Restart Docker Desktop
# Rebuild application
docker-compose up --build
```

### Data Recovery
```cmd
# If database is corrupted, restore from backup
# See backup.md for detailed procedures
```

## Contact Support

When reporting issues, include:
- Windows version (`winver`)
- Docker Desktop version (`docker --version`)
- Error messages from logs
- Steps to reproduce the issue
- System resource usage (`docker stats`)
