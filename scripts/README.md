# TERRAS Deployment Scripts

Kumpulan script untuk memudahkan testing lokal dan deployment ke Azure.

## 📋 Prerequisites

- Docker & Docker Compose
- Azure CLI
- Azure Student Subscription

## 🚀 Quick Start Guide

### 1. Testing Lokal

```bash
# Build dan jalankan semua containers
./scripts/local-test.sh
```

Script ini akan:
- ✅ Clean up containers sebelumnya
- ✅ Build semua Docker images
- ✅ Start semua containers
- ✅ Health check semua services
- ✅ Display access URLs

**Access URLs:**
- User App: http://localhost:5173
- Admin App: http://localhost:5174
- Auth App: http://localhost:5175

### 2. Setup Azure Resources

```bash
# Setup Azure (Resource Group, ACR, Container Apps Environment)
./scripts/setup-azure.sh
```

Script ini akan:
- ✅ Check Azure CLI
- ✅ Login ke Azure
- ✅ Create Resource Group
- ✅ Create Azure Container Registry
- ✅ Create Container Apps Environment
- ✅ Save credentials ke `.azure-credentials`

**⚠️ PENTING:** File `.azure-credentials` berisi credentials sensitif. Jangan commit ke Git!

### 3. Push Images ke Azure Container Registry

```bash
# Push semua images ke ACR
./scripts/push-to-acr.sh <acr-name>

# Contoh:
./scripts/push-to-acr.sh terrasregistry
```

Script ini akan:
- ✅ Login ke ACR
- ✅ Tag semua images dengan ACR prefix
- ✅ Push images ke ACR
- ✅ Verify images di ACR

### 4. Deploy ke Azure

```bash
# Deploy semua services ke Azure Container Apps
./scripts/deploy-to-azure.sh
```

Script ini akan:
- ✅ Deploy databases (PostgreSQL, MongoDB)
- ✅ Deploy backend services (Auth, Room, Booking)
- ✅ Deploy frontend services
- ✅ Get semua URLs
- ✅ Save URLs ke `.azure-urls`

## 📝 Workflow Lengkap

### First Time Deployment

```bash
# 1. Test lokal dulu
./scripts/local-test.sh

# 2. Setup Azure resources
./scripts/setup-azure.sh

# 3. Push images ke ACR
./scripts/push-to-acr.sh terrasregistry

# 4. Deploy ke Azure
./scripts/deploy-to-azure.sh
```

### Update Deployment

Jika ada perubahan code:

```bash
# 1. Test lokal
./scripts/local-test.sh

# 2. Push updated images
./scripts/push-to-acr.sh terrasregistry

# 3. Update Azure deployment
az containerapp update \
  --name <service-name> \
  --resource-group terras-rg \
  --image terrasregistry.azurecr.io/<service-name>:latest
```

## 🛠️ Manual Commands

### Docker Compose

```bash
# Build images
docker compose build

# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f auth-service

# Restart a service
docker compose restart auth-service

# Remove everything including volumes
docker compose down -v
```

### Azure CLI

```bash
# Login
az login

# List subscriptions
az account list --output table

# Set subscription
az account set --subscription "subscription-name"

# List Container Apps
az containerapp list --resource-group terras-rg --output table

# View logs
az containerapp logs show \
  --name auth-service \
  --resource-group terras-rg \
  --follow

# Scale a service
az containerapp update \
  --name auth-service \
  --resource-group terras-rg \
  --min-replicas 1 \
  --max-replicas 5

# Update environment variables
az containerapp update \
  --name auth-service \
  --resource-group terras-rg \
  --set-env-vars "JWT_SECRET=new-secret"

# Delete a Container App
az containerapp delete \
  --name auth-service \
  --resource-group terras-rg \
  --yes
```

### Azure Container Registry

```bash
# Login to ACR
az acr login --name terrasregistry

# List repositories
az acr repository list --name terrasregistry --output table

# List tags for a repository
az acr repository show-tags \
  --name terrasregistry \
  --repository auth-service \
  --output table

# Delete an image
az acr repository delete \
  --name terrasregistry \
  --image auth-service:old-tag \
  --yes
```

## 🐛 Troubleshooting

### Container tidak start

```bash
# Cek logs
docker compose logs <service-name>

# Di Azure
az containerapp logs show \
  --name <service-name> \
  --resource-group terras-rg \
  --follow
```

### Database connection failed

**Lokal:**
- Pastikan containers di network yang sama
- Gunakan container name sebagai hostname (bukan localhost)

**Azure:**
- Pastikan ingress type benar (internal untuk DB)
- Cek environment variables

### Port sudah digunakan

```bash
# Stop semua containers
docker compose down

# Kill process di port tertentu (Linux)
sudo lsof -ti:5173 | xargs kill -9
```

### Azure CLI errors

```bash
# Update Azure CLI
az upgrade

# Re-login
az logout
az login

# Install/update extensions
az extension add --name containerapp --upgrade
```

## 💰 Cost Management

### Estimasi Biaya (Student Subscription)

- Container Apps Environment: ~$0 (free tier)
- Each container: ~$15-30/month
- Total: ~$50-100/month

### Tips Hemat

```bash
# Stop semua containers (tidak delete)
az containerapp update \
  --name <service-name> \
  --resource-group terras-rg \
  --min-replicas 0 \
  --max-replicas 0

# Delete semua resources setelah demo
az group delete --name terras-rg --yes
```

## 📊 Monitoring

### View Container Logs

```bash
# Real-time logs
az containerapp logs show \
  --name auth-service \
  --resource-group terras-rg \
  --follow

# Last 100 lines
az containerapp logs show \
  --name auth-service \
  --resource-group terras-rg \
  --tail 100
```

### Check Container Status

```bash
# List all apps
az containerapp list \
  --resource-group terras-rg \
  --output table

# Show specific app details
az containerapp show \
  --name auth-service \
  --resource-group terras-rg
```

### View Metrics

```bash
# Get replica count
az containerapp replica list \
  --name auth-service \
  --resource-group terras-rg \
  --output table
```

## 🔐 Security Best Practices

1. **Never commit credentials**
   - `.azure-credentials` dan `.azure-urls` sudah di `.gitignore`
   - Jangan share credentials di chat/email

2. **Change default passwords**
   - Update `JWT_SECRET` di production
   - Gunakan strong passwords untuk databases

3. **Use managed identities** (advanced)
   - Untuk production, gunakan Azure Managed Identity
   - Hindari hardcoded credentials

4. **Enable HTTPS only**
   - Azure Container Apps sudah auto-enable HTTPS
   - Redirect HTTP ke HTTPS

## 📚 Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)

## 🆘 Support

Jika ada masalah:
1. Cek logs dengan `docker compose logs` atau `az containerapp logs show`
2. Verify environment variables
3. Check network connectivity
4. Review Azure Portal untuk status containers

---

**Good luck! 🚀**
