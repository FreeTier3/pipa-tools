
# Backup and Maintenance Guide

## Database Backup Procedures

### Automatic Backup (Windows)

#### Create Backup Script
Create `backup-db.bat`:
```cmd
@echo off
set BACKUP_DIR=%cd%\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo Creating backup: backup-%TIMESTAMP%.tar.gz
docker run --rm -v database_data:/data -v "%BACKUP_DIR%":/backup alpine tar czf /backup/backup-%TIMESTAMP%.tar.gz -C /data .

echo Backup completed: %BACKUP_DIR%\backup-%TIMESTAMP%.tar.gz
```

#### Schedule with Task Scheduler
```cmd
# Create daily backup task at 2 AM
schtasks /create /tn "InfraTools-DailyBackup" /tr "C:\path\to\backup-db.bat" /sc daily /st 02:00 /ru SYSTEM
```

### Manual Backup Commands

#### Windows Command Prompt
```cmd
# Create backup directory
mkdir backups

# Create timestamped backup
docker run --rm -v database_data:/data -v %cd%\backups:/backup alpine tar czf /backup/backup-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%.tar.gz -C /data .
```

#### PowerShell
```powershell
# Create backup with PowerShell
$date = Get-Date -Format "yyyyMMdd-HHmm"
$backupDir = "backups"
if (!(Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir }

docker run --rm -v database_data:/data -v "${PWD}\${backupDir}:/backup" alpine tar czf "/backup/backup-$date.tar.gz" -C /data .
Write-Host "Backup created: backup-$date.tar.gz"
```

### Restore Procedures

#### Restore from Backup
```cmd
# Stop application
docker-compose down

# Restore specific backup (replace filename)
docker run --rm -v database_data:/data -v %cd%\backups:/backup alpine tar xzf /backup/backup-YYYYMMDD-HHMM.tar.gz -C /data .

# Start application
docker-compose up -d

# Verify restore
docker-compose logs app
```

#### Emergency Restore
```cmd
# If current data is corrupted
docker-compose down
docker volume rm database_data
docker volume create database_data

# Restore from latest backup
docker run --rm -v database_data:/data -v %cd%\backups:/backup alpine tar xzf /backup/backup-latest.tar.gz -C /data .

# Start application
docker-compose up --build -d
```

## Backup Verification

### Test Backup Integrity
```cmd
# Test if backup can be extracted
docker run --rm -v %cd%\backups:/backup alpine tar -tzf /backup/backup-YYYYMMDD-HHMM.tar.gz

# Verify backup contents
docker run --rm -v %cd%\backups:/backup alpine tar -tvf /backup/backup-YYYYMMDD-HHMM.tar.gz
```

### Backup Size Monitoring
```cmd
# Check backup sizes
dir backups\*.tar.gz

# Monitor backup growth
powershell "Get-ChildItem backups\*.tar.gz | Sort-Object CreationTime | Select-Object Name, @{Name='SizeMB';Expression={[math]::Round($_.Length/1MB,2)}}, CreationTime"
```

## Maintenance Procedures

### Regular Cleanup

#### Clean Old Backups (Keep Last 30 Days)
Create `cleanup-backups.bat`:
```cmd
@echo off
set BACKUP_DIR=%cd%\backups
forfiles /p "%BACKUP_DIR%" /s /m *.tar.gz /d -30 /c "cmd /c del @path"
echo Old backups cleaned up
```

#### Docker System Cleanup
```cmd
# Remove unused containers, networks, images
docker system prune -f

# Remove build cache
docker builder prune -f

# Check disk usage
docker system df
```

### Database Maintenance

#### Check Database Health
```cmd
# Enter container and check database
docker-compose exec app sh
# Inside container:
# sqlite3 database/db.sqlite ".schema"
# sqlite3 database/db.sqlite "PRAGMA integrity_check;"
```

#### Optimize Database
Create `optimize-db.bat`:
```cmd
@echo off
echo Optimizing database...
docker-compose exec app sqlite3 /app/database/db.sqlite "VACUUM;"
docker-compose exec app sqlite3 /app/database/db.sqlite "PRAGMA optimize;"
echo Database optimization completed
```

## Monitoring and Alerts

### Backup Monitoring Script
Create `check-backup.ps1`:
```powershell
param(
    [int]$MaxDaysOld = 1
)

$backupDir = "backups"
$cutoffDate = (Get-Date).AddDays(-$MaxDaysOld)

$recentBackups = Get-ChildItem "$backupDir\*.tar.gz" | Where-Object { $_.CreationTime -gt $cutoffDate }

if ($recentBackups.Count -eq 0) {
    Write-Warning "No recent backups found! Last backup is older than $MaxDaysOld days."
    exit 1
} else {
    Write-Host "Recent backup found: $($recentBackups[0].Name)"
    exit 0
}
```

### Health Check Script
Create `health-check.bat`:
```cmd
@echo off
echo Checking application health...

# Check if containers are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo ERROR: Containers are not running
    exit /b 1
)

# Check application response
curl -f http://localhost:8080/ >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Application not responding
    exit /b 1
)

echo Health check passed
```

## Update Procedures

### Safe Update Process

#### Pre-Update Backup
Create `pre-update-backup.bat`:
```cmd
@echo off
echo Creating pre-update backup...

set TIMESTAMP=pre-update-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%

# Stop application
docker-compose down

# Create backup
docker run --rm -v database_data:/data -v %cd%\backups:/backup alpine tar czf /backup/backup-%TIMESTAMP%.tar.gz -C /data .

echo Pre-update backup created: backup-%TIMESTAMP%.tar.gz
echo Application stopped. Ready for update.
```

#### Post-Update Verification
Create `post-update-verify.bat`:
```cmd
@echo off
echo Starting post-update verification...

# Start application
docker-compose up -d --build

# Wait for startup
timeout /t 30 /nobreak

# Health check
call health-check.bat
if %errorlevel% neq 0 (
    echo UPDATE FAILED: Rolling back...
    call rollback.bat
    exit /b 1
)

echo Update verification passed
```

#### Rollback Procedure
Create `rollback.bat`:
```cmd
@echo off
echo Rolling back to previous backup...

# Stop current version
docker-compose down

# Find latest pre-update backup
for /f "tokens=*" %%a in ('dir /b /o:-d backups\backup-pre-update-*.tar.gz 2^>nul') do (
    set LATEST_BACKUP=%%a
    goto :found
)

:found
if not defined LATEST_BACKUP (
    echo ERROR: No pre-update backup found
    exit /b 1
)

echo Restoring from: %LATEST_BACKUP%

# Restore backup
docker run --rm -v database_data:/data -v %cd%\backups:/backup alpine tar xzf /backup/%LATEST_BACKUP% -C /data .

# Start application
docker-compose up -d --build

echo Rollback completed
```

## Storage Management

### Backup Storage Locations

#### Local Storage
- **Primary**: `%PROJECT_DIR%\backups\`
- **Secondary**: External drive or network location
- **Retention**: 30 days local, 90 days secondary

#### Cloud Storage Integration
```powershell
# Example: Copy to cloud storage (requires cloud CLI tools)
$latestBackup = Get-ChildItem "backups\*.tar.gz" | Sort-Object CreationTime -Descending | Select-Object -First 1

# Upload to cloud (example with AWS CLI)
# aws s3 cp $latestBackup.FullName s3://your-backup-bucket/infra-tools/

# Upload to Azure (example with Azure CLI)
# az storage blob upload --file $latestBackup.FullName --container-name backups --name $latestBackup.Name
```

### Disk Space Management

#### Monitor Disk Usage
```cmd
# Check overall disk usage
fsutil volume diskfree c:

# Check Docker disk usage
docker system df

# Check backup folder size
powershell "Get-ChildItem backups -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name='SizeGB';Expression={[math]::Round($_.Sum/1GB,2)}}"
```

#### Cleanup Procedures
```cmd
# Clean Docker cache
docker builder prune -a -f

# Clean old backups (older than 30 days)
forfiles /p backups /s /m *.tar.gz /d -30 /c "cmd /c del @path"

# Clean temporary files
del /q "%TEMP%\*"
```
