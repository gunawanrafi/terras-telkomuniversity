# Nginx Reverse Proxy Setup

Complete guide for setting up Nginx as a reverse proxy for TERRAS on Azure VM.

---

## Prerequisites

- Azure VM with Ubuntu 20.04+
- Docker containers running
- Domain name or Azure DNS label configured

---

## Installation

### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Verify Installation

```bash
sudo systemctl status nginx
# Should show "active (running)"

# Test default page
curl localhost
```

---

## Configuration

### Single Domain Setup (Recommended)

This setup uses one domain with port 80 for main app:

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/terras
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name terras-telkomuniversity.eastasia.cloudapp.azure.com;

    # Main User App
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Auth API
    location /api/auth/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Room API
    location /api/rooms/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Booking API
    location /api/bookings/ {
        proxy_pass http://localhost:3003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Enable Configuration

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/terras /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Azure Network Security Group

Open port 80 for HTTP traffic:

```bash
# Via Azure CLI
az network nsg rule create \
  --resource-group terras \
  --nsg-name terras-nsg \
  --name Allow-HTTP \
  --priority 1000 \
  --destination-port-ranges 80 \
  --access Allow \
  --protocol Tcp
```

Or via Azure Portal:
1. Navigate to your VM → Networking
2. Add inbound port rule
3. Port: 80, Protocol: TCP, Action: Allow

---

## SSL/HTTPS Setup (Optional but Recommended)

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificate

```bash
# For single domain
sudo certbot --nginx -d terras-telkomuniversity.eastasia.cloudapp.azure.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (option 2)
```

### Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

---

## Verification

### Test Endpoints

```bash
# Main app
curl http://your-domain.com

# API endpoints
curl http://your-domain.com/api/auth/health
curl http://your-domain.com/api/rooms/buildings
```

### Check Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### 502 Bad Gateway

Backend service not running:
```bash
# Check Docker containers
docker ps

# Check service logs
docker logs terras_frontend_user
```

### 404 Not Found

Nginx config issue:
```bash
# Test config
sudo nginx -t

# Check path in config
cat /etc/nginx/sites-available/terras
```

### Connection Refused

Port not open:
```bash
# Check NSG rules
az network nsg rule list --resource-group terras --nsg-name terras-nsg -o table
```

---

## Maintenance

### Reload Configuration

After config changes:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Restart Nginx

```bash
sudo systemctl restart nginx
```

### View Status

```bash
sudo systemctl status nginx
```

---

**Done! Your application is now accessible via clean URLs without port numbers!** 🎉
