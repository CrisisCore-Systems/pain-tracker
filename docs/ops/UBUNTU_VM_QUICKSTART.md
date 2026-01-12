# Ubuntu VM Deployment - Quick Reference

## 🚀 One-Page Setup Guide

### 1. VM Bootstrap (Run Once)

```bash
# SSH to your Ubuntu 22.04 VM
ssh your-user@your-vm-ip

# Run bootstrap script
curl -fsSL https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/scripts/deployment/bootstrap-ubuntu-vm.sh | bash
```

### 2. SSH Deploy Key (Local Machine)

```bash
# Generate key
ssh-keygen -t ed25519 -C "pain-tracker-deploy" -f ~/.ssh/pain-tracker-deploy

# Copy to VM
ssh-copy-id -i ~/.ssh/pain-tracker-deploy.pub deploy@YOUR_VM_IP

# Display private key for GitHub
cat ~/.ssh/pain-tracker-deploy
```

### 3. GitHub Secrets

Repository → Settings → Secrets → Actions → New secret

| Name | Value |
|------|-------|
| `SSH_PRIVATE_KEY` | Output from `cat ~/.ssh/pain-tracker-deploy` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_HOST` | `your.domain.example` |

### 4. Nginx Setup (On VM)

```bash
# Copy nginx config (adjust path if needed)
sudo cp ~/pain-tracker/deployment/nginx/pain-tracker /etc/nginx/sites-available/

# Edit domain name
sudo nano /etc/nginx/sites-available/pain-tracker
# Replace: your.domain.example → your-actual-domain.com

# Enable site
sudo ln -s /etc/nginx/sites-available/pain-tracker /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. DNS Configuration

Point your domain to VM IP:
```
Type: A
Name: @
Value: YOUR_VM_IP
```

Wait 5-30 minutes for DNS propagation.

### 6. SSL Certificate (On VM, after DNS propagates)

```bash
# Issue certificate
sudo certbot --nginx -d your.domain.example

# Uncomment HTTPS block in nginx config
sudo nano /etc/nginx/sites-available/pain-tracker
# Remove # from line 22 onwards (HTTPS server { ... })

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 7. Deploy Application

```bash
# Push to main branch
git push origin main
```

GitHub Actions will build and deploy automatically!

### 8. Verify

```bash
# Test health endpoint
curl https://your.domain.example/healthz

# Visit in browser
open https://your.domain.example
```

---

## 🔧 Common Commands

### Check Deployment Status
```bash
# View nginx logs
sudo tail -f /var/log/nginx/pain-tracker-access.log

# Check nginx status
sudo systemctl status nginx

# Reload nginx after config changes
sudo nginx -t && sudo systemctl reload nginx
```

### Manual Deployment
```bash
# On local machine
npm run build
tar -czf release.tar.gz -C dist .
scp release.tar.gz deploy@your.domain.example:/tmp/

# On VM
sudo tar -xzf /tmp/release.tar.gz -C /srv/pain-tracker
sudo chown -R www-data:www-data /srv/pain-tracker
sudo systemctl reload nginx
```

### Rollback
```bash
# On VM
ls /srv/pain-tracker-backups/
sudo tar -xzf /srv/pain-tracker-backups/backup-20241116-140530.tar.gz -C /srv
sudo systemctl reload nginx
```

### View Logs
```bash
# Nginx access log
sudo tail -f /var/log/nginx/pain-tracker-access.log

# Nginx error log
sudo tail -f /var/log/nginx/pain-tracker-error.log

# Search for errors
sudo grep -i error /var/log/nginx/pain-tracker-error.log
```

---

## 🐛 Troubleshooting

### Nginx won't start
```bash
sudo nginx -t                    # Check config syntax
sudo systemctl status nginx      # Check service status
sudo journalctl -u nginx -n 50   # View recent logs
```

### Site not accessible
```bash
sudo systemctl status nginx      # Is nginx running?
sudo ufw status                  # Is firewall blocking?
dig your.domain.example          # DNS resolving correctly?
curl -v http://localhost         # Test locally on VM
```

### SSL certificate issues
```bash
sudo certbot certificates        # List certificates
sudo certbot renew --dry-run     # Test renewal
sudo systemctl status certbot.timer  # Check auto-renewal timer
```

### Deployment fails
```bash
# Check GitHub Actions logs in repository
# Verify SSH key in GitHub secrets
# Ensure deploy user has sudo access
ssh deploy@your.domain.example "sudo -l"
```

---

## 📊 Monitoring URLs

After setup, add these to monitoring:

- **UptimeRobot**: `https://your.domain.example/healthz`
- **Netdata**: `http://YOUR_VM_IP:19999`
- **Cloudflare**: Dashboard for DNS and analytics

---

## 📁 File Locations

| Purpose | Path |
|---------|------|
| Static files | `/srv/pain-tracker/` |
| Nginx config | `/etc/nginx/sites-available/pain-tracker` |
| Nginx logs | `/var/log/nginx/pain-tracker-*.log` |
| Backups | `/srv/pain-tracker-backups/` |
| SSL certs | `/etc/letsencrypt/live/your.domain.example/` |
| Logrotate | `/etc/logrotate.d/pain-tracker` |

---

## 🔐 Security Checklist

- [ ] SSH key-only authentication (no passwords)
- [ ] UFW firewall enabled (ports 22, 80, 443 only)
- [ ] SSL certificate installed and auto-renewing
- [ ] Deploy user has limited sudo permissions
- [ ] Regular automatic security updates enabled
- [ ] Backups configured and tested
- [ ] Monitoring alerts configured

---

## 💰 Cost

**Oracle Cloud Always Free**: $0/month forever

Includes:
- 2 AMD VMs (1GB RAM each) or 4 ARM VMs (6GB RAM each)
- 200GB storage
- 10TB/month outbound transfer

**Total Cost**: $0 🎉

---

For detailed documentation, see: [UBUNTU_VM_DEPLOYMENT.md](./UBUNTU_VM_DEPLOYMENT.md)
