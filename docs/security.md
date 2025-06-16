
# Security Configuration Guide

## Windows Firewall Configuration

### Basic Firewall Rules
```cmd
# Allow application on local network only
netsh advfirewall firewall add rule name="InfraTools-Local" dir=in action=allow protocol=TCP localport=8080 remoteip=localsubnet

# Allow specific IP addresses
netsh advfirewall firewall add rule name="InfraTools-Specific" dir=in action=allow protocol=TCP localport=8080 remoteip=192.168.1.100,192.168.1.101

# Block all other access (default Windows behavior)
```

### Advanced Firewall Configuration
```cmd
# Create firewall profile for development
netsh advfirewall firewall add rule name="InfraTools-Dev" dir=in action=allow protocol=TCP localport=8080 profile=private

# Create firewall profile for production
netsh advfirewall firewall add rule name="InfraTools-Prod" dir=in action=allow protocol=TCP localport=8080 profile=domain,public remoteip=localsubnet
```

### View Current Firewall Rules
```cmd
# List all rules for port 8080
netsh advfirewall firewall show rule name=all | findstr 8080

# Show detailed firewall status
netsh advfirewall show allprofiles
```

## Docker Security

### Container Security
```yaml
# Security configurations already in docker-compose.yml:
security_opt:
  - no-new-privileges:true
read_only: false  # Disabled for SQLite writes
user: "node"      # Non-root user when possible
```

### Network Security
```cmd
# Inspect Docker networks
docker network ls
docker network inspect app-network

# Check container network isolation
docker-compose exec app netstat -tuln
```

### Volume Security
```cmd
# Check volume permissions
docker volume inspect database_data

# Set proper file permissions in container
docker-compose exec app chmod 755 /app/database
docker-compose exec app chown -R node:node /app/database
```

## Access Control

### Local Network Access
```cmd
# Find VM IP address
ipconfig /all

# Test network connectivity
ping 192.168.1.XXX
telnet 192.168.1.XXX 8080
```

### User Access Management
```cmd
# Create Windows user for application management
net user infratools-admin StrongPassword123! /add
net localgroup administrators infratools-admin /add

# Set folder permissions
icacls "C:\path\to\project" /grant infratools-admin:F
```

## Data Protection

### Database Security
```cmd
# Check database file permissions
docker-compose exec app ls -la /app/database/

# Backup encryption (using 7-Zip)
7z a -p"BackupPassword123!" backup-encrypted.7z backups\backup-latest.tar.gz
```

### Sensitive Data Handling
```yaml
# Environment variables in docker-compose.yml
environment:
  - NODE_ENV=production
  - DATABASE_ENCRYPTION_KEY=${DB_KEY}  # Set in .env file
```

### SSL/TLS Configuration
```cmd
# For production with reverse proxy (nginx/IIS)
# Generate self-signed certificate for testing
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

## Monitoring and Logging

### Security Monitoring
```cmd
# Monitor failed login attempts (if authentication added)
docker-compose logs app | findstr "failed\|error\|unauthorized"

# Monitor unusual network activity
netstat -an | findstr :8080
```

### Audit Logging
```powershell
# Enable Windows audit logging
auditpol /set /category:"Object Access" /success:enable /failure:enable

# Monitor file access to project directory
# Configure in Group Policy or Security Policy
```

### Log Management
```cmd
# Rotate Docker logs
docker-compose logs --tail 1000 app > logs\app-$(date +%Y%m%d).log

# Clean old logs
forfiles /p logs /s /m *.log /d -7 /c "cmd /c del @path"
```

## Windows Security Hardening

### System Updates
```cmd
# Check Windows Update status
wuauclt /detectnow

# Install critical updates
powershell "Get-WUInstall -AcceptAll -AutoReboot"
```

### Service Hardening
```cmd
# Disable unnecessary services
sc config "Remote Registry" start= disabled
sc config "Windows Search" start= disabled

# Configure Docker service
sc config com.docker.service start= auto
```

### Account Security
```cmd
# Set strong password policy
net accounts /minpwlen:12 /maxpwage:90 /minpwage:1

# Disable guest account
net user guest /active:no

# Configure account lockout
net accounts /lockoutthreshold:5 /lockoutduration:30
```

## Backup Security

### Secure Backup Storage
```cmd
# Encrypt backup files
gpg --symmetric --cipher-algo AES256 backup-latest.tar.gz

# Store encryption key securely
# Use Windows Credential Manager or Azure Key Vault
```

### Backup Verification
```cmd
# Verify backup integrity
certutil -hashfile backup-latest.tar.gz SHA256

# Test backup restore in isolated environment
docker run --rm -v backup_test:/data -v %cd%\backups:/backup alpine tar xzf /backup/backup-latest.tar.gz -C /data
```

## Network Security

### Network Segmentation
```cmd
# Create isolated Docker network
docker network create --driver bridge --subnet=172.20.0.0/16 infra-network

# Update docker-compose.yml to use custom network
```

### VPN Configuration
```cmd
# If using VPN, ensure Docker networks don't conflict
route print
ipconfig /all

# Configure VPN to exclude Docker subnets
```

### Port Security
```cmd
# Change default port (modify docker-compose.yml)
ports:
  - "8443:8080"  # Use non-standard port

# Update firewall rules accordingly
netsh advfirewall firewall add rule name="InfraTools-8443" dir=in action=allow protocol=TCP localport=8443
```

## Incident Response

### Security Incident Checklist
1. **Immediate Response**:
   ```cmd
   # Stop application
   docker-compose down

   # Isolate system
   netsh interface set interface "Ethernet" admin=disable
   ```

2. **Evidence Collection**:
   ```cmd
   # Collect logs
   docker-compose logs app > incident-logs-%date%.txt
   
   # System information
   systeminfo > system-info-%date%.txt
   
   # Network connections
   netstat -an > network-connections-%date%.txt
   ```

3. **Recovery**:
   ```cmd
   # Restore from clean backup
   call rollback.bat
   
   # Update passwords and keys
   # Rebuild containers from scratch
   docker-compose build --no-cache
   ```

## Compliance and Auditing

### Audit Trail
```cmd
# Enable Docker audit logging
# Add to Docker daemon.json:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Security Checklist
- [ ] Windows updates installed
- [ ] Firewall properly configured
- [ ] Strong passwords enforced
- [ ] Backup encryption enabled
- [ ] Audit logging configured
- [ ] Network access restricted
- [ ] Container security implemented
- [ ] Regular security scans performed

### Regular Security Tasks
```cmd
# Weekly security scan
docker scan infra-tools:latest

# Monthly security review
# Review firewall rules
# Check for unauthorized access
# Verify backup integrity
# Update security patches
```

## External Security Tools

### Antivirus Configuration
- Add Docker directories to exclusions
- Exclude project folder from real-time scanning
- Schedule regular full system scans

### Network Monitoring
```cmd
# Use Windows Performance Toolkit
# Monitor network traffic
netsh trace start capture=yes provider=Microsoft-Windows-TCPIP

# Stop monitoring
netsh trace stop
```

### Vulnerability Assessment
```cmd
# Use Microsoft Baseline Security Analyzer
mbsacli.exe /target 127.0.0.1 /n os+iis+sql+password

# Docker security scanning
docker scout cves infra-tools:latest
```
