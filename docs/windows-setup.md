
# Windows 10 Pro 22H2 Setup Guide

## Initial Docker Desktop Installation

### 1. Download and Install Docker Desktop
- Download from [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- Run installer as administrator
- Restart system when prompted

### 2. Enable WSL2 (Recommended)
```cmd
# Run in PowerShell as administrator
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart system and download WSL2 kernel
# https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi

wsl --set-default-version 2
```

### 3. Configure Docker Desktop
- Open Docker Desktop
- Go to Settings > General
- Check "Use WSL 2 based engine" (if available)
- In Resources > WSL Integration, enable integration

## Windows System Configuration

### Enable Hyper-V
```cmd
# Run as administrator
DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V
```

### Configure Firewall
```cmd
# Run as administrator
netsh advfirewall firewall add rule name="Infra-Tools" dir=in action=allow protocol=TCP localport=8080
```

### Power Settings
- Set power plan to "High Performance"
- Disable sleep/hibernation for server use

## VM Resource Configuration

### Docker Desktop Resources
- Docker Desktop > Settings > Resources
- Recommended: 4 CPUs, 8GB RAM
- Adjust based on available VM resources

### Windows Performance
```cmd
# Performance monitor
perfmon

# Task Manager - Performance tab
taskmgr
```

## Network Configuration

### Local Network Access
```cmd
# Find VM IP address
ipconfig /all

# Configure firewall for local network
netsh advfirewall firewall add rule name="Docker-Infra-Tools" dir=in action=allow protocol=TCP localport=8080 remoteip=localsubnet
```

### External Access (if needed)
```cmd
# Allow external connections (use with caution)
netsh advfirewall firewall add rule name="Docker-External" dir=in action=allow protocol=TCP localport=8080
```

## Verification Commands

```cmd
# Check Docker installation
docker --version
docker-compose --version

# Verify Hyper-V
bcdedit /enum | findstr hypervisor

# Check WSL2
wsl --status

# Test Docker
docker system info

# Network connectivity test
ping localhost
telnet localhost 8080
```

## Performance Optimization

### WSL2 Configuration
```cmd
# Check WSL distributions
wsl --list --verbose

# Update WSL2
wsl --update

# Set WSL2 as default
wsl --set-default-version 2
```

### Resource Cleanup
```cmd
# Clean Docker resources
docker system prune -a
docker volume prune
```

## Antivirus Configuration

Configure antivirus exclusions for:
- Docker Desktop installation folder
- WSL2 directories
- Project source code folder
- Docker volumes location

## Automatic Updates

### Windows Update
- Keep system updated
- Configure maintenance windows
- Schedule outside business hours

### Task Scheduler for Backups
```cmd
# Create daily backup task
schtasks /create /tn "InfraTools-Backup" /tr "C:\path\to\backup-script.bat" /sc daily /st 02:00
```
