# Deployment Guide

Complete deployment guide for TERRAS Room Booking System from development to production.

---

## Deployment Options

1. **Local Development** - Docker Compose on your machine
2. **Azure VM** - Single VM deployment (current)
3. **Azure Container Apps** - Managed containers (future scaling)

---

## Local Development Deployment

### Prerequisites
- Docker Desktop installed
- 8GB RAM minimum
- Git installed

### Steps

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/terras-room-booking.git
cd terras-room-booking

# 2. Create .env files
cp services/frontend-user/.env.example services/frontend-user/.env
cp services/frontend-admin/.env.example services/frontend-admin/.env
cp services/frontend-auth/.env.example services/frontend-auth/.env

# 3. Start services
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Access
# User: http://localhost:5173
# Admin: http://localhost:5174
# Auth: http://localhost:5175
```

---

## Azure VM Deployment

### Step 1: Create Azure VM

**Via Azure Portal:**
1. Create Resource Group: `terras-rg`
2. Create Virtual Machine:
   - Image: Ubuntu 20.04 LTS
   - Size: Standard_B2s (2 vCPUs, 4GB RAM)
   - Authentication: SSH public key
   - Open ports: 22, 80, 443

**Via Azure CLI:**
```bash
# Login
az login

# Create resource group
az group create --name terras-rg --location eastasia

# Create VM
az vm create \
  --resource-group terras-rg \
  --name terras-vm \
  --image Ubuntu2004 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Open ports
az vm open-port --resource-group terras-rg --name terras-vm --port 80 --priority 1001
az vm open-port --resource-group terras-rg --name terras-vm --port 443 --priority 1002
```

### Step 2: Setup DNS Label (Optional)

```bash
# Get public IP name
az network public-ip list --resource-group terras-rg -o table

# Set DNS label
az network public-ip update \
  --resource-group terras-rg \
  --name terras-vm-ip \
  --dns-name terras-telkomuniversity
```

Your VM will be accessible at:
```
terras-telkomuniversity.eastasia.cloudapp.azure.com
```

### Step 3: Connect to VM

```bash
# Get VM IP
VM_IP=$(az vm show -d --resource-group terras-rg --name terras-vm --query publicIps -o tsv)

# SSH to VM
ssh azureuser@$VM_IP
```

### Step 4: Install Docker

```bash
# Update packages
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again for group changes
exit
# Then SSH back in
```

### Step 5: Install Docker Compose

```bash
# Install Docker Compose
sudo apt install docker-compose -y

# Verify
docker-compose --version
```

### Step 6: Clone and Configure

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/terras-room-booking.git
cd terras-room-booking

# Create .env files with production URLs
VM_DOMAIN="terras-telkomuniversity.eastasia.cloudapp.azure.com"

cat > services/frontend-user/.env << EOF
VITE_API_URL=http://${VM_DOMAIN}:3001
VITE_ROOM_SERVICE=http://${VM_DOMAIN}:3002
VITE_BOOKING_SERVICE=http://${VM_DOMAIN}:3003
VITE_AUTH_APP_URL=http://${VM_DOMAIN}:5175
VITE_USER_APP_URL=http://${VM_DOMAIN}:5173
VITE_ADMIN_APP_URL=http://${VM_DOMAIN}:5174
EOF

# Repeat for frontend-admin and frontend-auth
```

### Step 7: Deploy Application

```bash
# Start services
docker-compose up -d

# Check status
docker ps

# View logs
docker-compose logs -f
```

### Step 8: Configure Reverse Proxy

See [nginx-setup.md](./nginx-setup.md) for detailed Nginx configuration.

### Step 9: Setup SSL (Production)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d terras-telkomuniversity.eastasia.cloudapp.azure.com

# Auto-renewal is configured automatically
```

---

## Production Checklist

Before going live:

- [ ] Environment variables updated for production
- [ ] SSL/HTTPS configured
- [ ] Firewall rules configured
- [ ] Database backups configured
- [ ] Monitoring setup (optional)
- [ ] Change default admin password
- [ ] Update JWT_SECRET to strong random value
- [ ] Test all features work
- [ ] Test on mobile devices

---

## Updating Deployed Application

### Pull Latest Changes

```bash
# On VM
cd ~/terras-room-booking

# Pull updates
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build
docker-compose up -d
```

### Zero Downtime Update

```bash
# Build new images
docker-compose build

# Rolling update
docker-compose up -d --no-deps --build frontend-user
docker-compose up -d --no-deps --build frontend-admin
docker-compose up -d --no-deps --build frontend-auth
```

---

## Backup & Restore

### Backup Database

```bash
# PostgreSQL backup
docker exec terras_postgres pg_dump -U postgres terras_auth > backup_postgres.sql

# MongoDB backup
docker exec terras_mongo mongodump --db terras_rooms --out /tmp/backup
docker cp terras_mongo:/tmp/backup ./backup_mongo
```

### Restore Database

```bash
# PostgreSQL restore
docker exec -i terras_postgres psql -U postgres terras_auth < backup_postgres.sql

# MongoDB restore
docker cp ./backup_mongo terras_mongo:/tmp/backup
docker exec terras_mongo mongorestore /tmp/backup
```

---

## Monitoring

### Check Container Health

```bash
# Container status
docker ps

# Resource usage
docker stats

# Logs
docker-compose logs -f --tail=100
```

### System Resources

```bash
# CPU/Memory
htop

# Disk usage
df -h

# Network connections
netstat -tulpn
```

---

## Troubleshooting Production

### Service Won't Start

```bash
# Check logs
docker-compose logs service-name

# Restart service
docker-compose restart service-name

# Rebuild if needed
docker-compose up -d --build service-name
```

### Database Connection Failed

```bash
# Check database container
docker ps | grep -E 'postgres|mongo'

# Check connection from backend
docker exec terras_auth_service curl postgres:5432
```

### High Memory Usage

```bash
# Check container memory
docker stats

# Increase VM size if needed
az vm resize --resource-group terras-rg --name terras-vm --size Standard_B4ms
```

---

## Cost Optimization

### Azure VM Costs

- B2s (Current): ~$30/month
- Auto-shutdown: Save 50% with night shutdown
- Reserved instances: Save 30-40%

### Reduce Costs

```bash
# Auto-shutdown VM at night
az vm auto-shutdown -g terras-rg -n terras-vm --time 2200
```

---

**Your TERRAS application is now deployed and production-ready!** 🚀
