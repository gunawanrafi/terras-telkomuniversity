# Troubleshooting Guide

Common issues and solutions for TERRAS Room Booking System.

---

## Docker Issues

### Containers Won't Start

**Symptom:** `docker-compose up` fails or containers exit immediately

**Solutions:**

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs service-name

# Common fix: Rebuild without cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Common causes:**
- Port already in use
- Missing environment variables
- Insufficient memory
- Corrupted Docker image

---

### Port Already in Use

**Error:** `port is already allocated`

**Solution:**

```bash
# Find process using port
sudo lsof -ti:5173

# Kill process
sudo lsof -ti:5173 | xargs kill -9

# Or kill all Docker containers
docker kill $(docker ps -q)
```

---

### Out of Memory

**Symptom:** Containers killed unexpectedly

**Solution:**

```bash
# Check Docker memory limit
docker info | grep Memory

# Increase Docker Desktop memory (Mac/Windows)
# Docker Desktop → Preferences → Resources → Memory: 4GB+

# On Linux, check system memory
free -h

# Stop unused services
docker-compose stop frontend-admin frontend-auth
```

---

## Database Issues

### PostgreSQL Connection Failed

**Error:** `ECONNREFUSED` or `Connection refused`

**Solution:**

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs terras_postgres

# Restart PostgreSQL
docker-compose restart postgres

# Verify connection from auth service
docker exec terras_auth_service nc -zv postgres 5432
```

---

### MongoDB Connection Failed

**Error:** `MongoNetworkError`

**Solution:**

```bash
# Check MongoDB container
docker ps | grep mongo

# Check logs
docker logs terras_mongo

# Restart MongoDB
docker-compose restart mongo

# Test connection
docker exec terras_mongo mongosh --eval "db.adminCommand('ping')"
```

---

### Database Data Lost

**Cause:** Docker volume deleted

**Solution:**

```bash
# Check volumes
docker volume ls

# Restore from backup (if available)
docker exec -i terras_postgres psql -U postgres terras_auth < backup.sql

# Or re-seed data (this will create sample data)
docker-compose restart room booking
```

---

## Frontend Issues

### Can't Connect to Backend

**Symptom:** API calls fail with CORS or network errors

**Diagnosis:**

```bash
# Check backend is running
curl http://localhost:3001/health
curl http://localhost:3002/rooms
curl http://localhost:3003/bookings

# Check from browser console
fetch('http://localhost:3001/health').then(r => r.json())
```

**Solutions:**

1. **Check .env files:**
```bash
cat services/frontend-user/.env
# Should have correct URLs
```

2. **Rebuild frontend:**
```bash
docker-compose down
docker-compose build frontend-user
docker-compose up -d
```

3. **Clear browser cache:**
- Hard refresh: Ctrl+Shift+R
- Or open DevTools → Disable cache

---

### White Screen / Blank Page

**Causes:**
- JavaScript error
- Build failed
- Wrong base URL

**Solution:**

```bash
# Check browser console (F12) for errors

# Check container logs
docker logs terras_frontend_user

# Rebuild
docker-compose build --no-cache frontend-user
docker-compose up -d
```

---

### Mobile Scroll Not Working

**Solution applied in code:**

Already fixed in `Home.jsx` and `index.css`:
- Removed `min-h-screen` constraints
- Added `-webkit-overflow-scrolling: touch`
- Modal forms have `overflow-y-auto`

If still having issues:
```bash
# Hard refresh on mobile
# Chrome: Hold refresh → Clear cache and hard reload

# Or test in incognito mode
```

---

## Authentication Issues

### JWT Token Invalid

**Error:** `401 Unauthorized` or `Invalid token`

**Solutions:**

1. **Token expired:** Login again
2. **Wrong token format:** Check Authorization header
3. **Different JWT_SECRET:** Restart auth service

```bash
# Generate new token
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@telkomuniversity.ac.id","password":"admin123"}'
```

---

### Can't Login

**Symptoms:**
- Wrong password error (but password is correct)
- User not found

**Solutions:**

```bash
# Check if user exists in database
docker exec terras_postgres psql -U postgres terras_auth -c "SELECT * FROM users;"

# Reset admin password
docker exec terras_postgres psql -U postgres terras_auth << EOF
UPDATE users SET password = '\$2a\$10\$...' WHERE email = 'admin@telkomuniversity.ac.id';
EOF

# Or restart auth service (will re-seed admin)
docker-compose restart auth
```

---

## Network Issues

### Can't Access from Other Devices

**On same network:**

```bash
# Check firewall
sudo ufw status

# Allow port
sudo ufw allow 5173/tcp

# Get your IP
ip addr show | grep inet

# Access from other device
http://YOUR_IP:5173
```

---

### Azure VM Not Accessible

**Solution:**

```bash
# Check NSG rules
az network nsg rule list --resource-group terras --nsg-name terras-nsg -o table

# Add rule if missing
az network nsg rule create \
  --resource-group terras \
  --nsg-name terras-nsg \
  --name Allow-5173 \
  --priority 1100 \
  --destination-port-ranges 5173 \
  --access Allow \
  --protocol Tcp
```

---

## Performance Issues

### Slow Page Load

**Solutions:**

```bash
# Check container resources
docker stats

# Optimize images (reduce Vite build size)
# In vite.config.js:
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true
    }
  }
}

# Enable compression in Nginx
gzip on;
gzip_types text/css application/javascript;
```

---

### High Memory Usage

**Solution:**

```bash
# Check which container uses most memory
docker stats --no-stream

# Limit container memory
# In docker-compose.yml:
services:
  frontend-user:
    mem_limit: 512m

# Restart with limits
docker-compose down
docker-compose up -d
```

---

## Development Issues

### Hot Reload Not Working

**In local development (not Docker):**

```bash
# Check Vite config allows network access
# vite.config.js:
server: {
  host: true,
  watch: {
    usePolling: true
  }
}

# Restart dev server
npm run dev
```

---

### npm install Fails

**Error:** `EACCES` or permission denied

**Solution:**

```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules

# Or use Docker to build
docker-compose build --no-cache
```

---

## Azure Deployment Issues

### DNS Not Resolving

**Error:** `Name or service not known`

**Solution:**

```bash
# Verify DNS label is set
az network public-ip show \
  --resource-group terras \
  --name terras-vm-ip \
  --query dnsSettings.fqdn

# Wait for DNS propagation (5-15 minutes)

# Test with dig
dig terras-telkomuniversity.eastasia.cloudapp.azure.com

# Or use IP directly as fallback
az vm show -d --resource-group terras --name terras-vm --query publicIps -o tsv
```

---

### SSL Certificate Failed

**Error:** Certbot fails to get certificate

**Solution:**

```bash
# Check domain points to VM
nslookup terras-telkomuniversity.eastasia.cloudapp.azure.com

# Check port 80 is open
curl -I http://terras-telkomuniversity.eastasia.cloudapp.azure.com

# Try again with verbose
sudo certbot --nginx -d your-domain.com --verbose

# Check Nginx config
sudo nginx -t
```

---

## Getting Help

If issues persist:

1. **Check logs:**
```bash
docker-compose logs -f --tail=100
```

2. **Search Issues:** github.com/YOUR_REPO/issues

3. **Create Issue:** Include:
   - Error message
   - Steps to reproduce
   - Environment (OS, Docker version)
   - Logs

4. **Contact:** your-email@example.com

---

**Still stuck? Open an issue on GitHub with full error logs!** 🆘
