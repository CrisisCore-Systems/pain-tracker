# Pain Tracker - Ubuntu VM Deployment Guide

## 🎯 Overview

This guide provides a **complete, minimal-resource deployment setup** for running Pain Tracker on a remote Ubuntu 22.04 VM (Oracle Cloud Always Free recommended). The setup eliminates laptop resource usage by running everything on a remote server with automated CI/CD.

### What This Setup Provides

- **Remote Hosting**: Oracle Cloud Always Free VM (or any Ubuntu 22.04 VM)
- **Static Site Serving**: Nginx serving pre-built React SPA
- **Reverse Proxy & TLS**: Nginx + Let's Encrypt (certbot) for HTTPS
- **CI/CD**: GitHub Actions builds on cloud runners, deploys via SSH
- **Monitoring**: Netdata (metrics/alerts) + UptimeRobot (uptime checks)
- **DNS/Protection**: Cloudflare free tier (DNS, caching, DDoS protection)
- **Backups**: rclone → Google Drive for offsite backups
- **Logging**: Nginx access/error logs + logrotate
- **Health Endpoints**: `/healthz` and `/ready` for monitoring

### Architecture

```
┌─────────────────┐
│   Developer     │
│    (Laptop)     │
│  Git + Editor   │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────────────┐
│    GitHub Actions       │
│  - npm install          │
│  - npm test             │
│  - npm run build        │
│  - Create release.tar.gz│
└────────┬────────────────┘
         │ SSH deploy
         ▼
┌─────────────────────────────┐
│   Ubuntu 22.04 VM           │
│  ┌─────────────────────┐   │
│  │   Nginx (HTTPS)     │   │
│  │  - Serves /srv/     │   │
│  │  - TLS termination  │   │
│  │  - Gzip compression │   │
│  └─────────────────────┘   │
│                             │
│  /srv/pain-tracker/         │
│  - index.html               │
│  - assets/                  │
│  - health/healthz.json      │
└─────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **Ubuntu 22.04 VM** (Oracle Cloud Always Free or similar)
   - Minimum: 1 CPU, 1GB RAM, 20GB disk
   - Public IP address
   - SSH access as a user with sudo

2. **Domain Name** (for HTTPS)
   - Registered domain or subdomain
   - DNS control (preferably via Cloudflare)

3. **GitHub Repository Access**
   - Admin access to set secrets
   - This repository cloned

### One-Command Setup

1. **On Remote VM**: Run the bootstrap script

```bash
# SSH into your VM
ssh your-user@your-vm-ip

# Download and run bootstrap
curl -fsSL https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/scripts/deployment/bootstrap-ubuntu-vm.sh | bash
```

2. **Configure SSH Deploy Key**

On your **local machine**:
```bash
# Generate SSH key pair for deployment
ssh-keygen -t ed25519 -C "pain-tracker-deploy" -f ~/.ssh/pain-tracker-deploy

# Copy public key to remote VM
ssh-copy-id -i ~/.ssh/pain-tracker-deploy.pub deploy@YOUR_VM_IP

# Display private key to add to GitHub Secrets
cat ~/.ssh/pain-tracker-deploy
# Copy the entire output (including -----BEGIN/END OPENSSH PRIVATE KEY-----)
```

3. **Configure GitHub Secrets**

Go to your GitHub repository:
- Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these three secrets:

| Secret Name | Value |
|-------------|-------|
| `SSH_PRIVATE_KEY` | Complete private key from `~/.ssh/pain-tracker-deploy` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_HOST` | `your.domain.example` (or VM IP initially) |

4. **Setup Nginx Configuration**

On the **remote VM**:
```bash
# Clone the repo temporarily (or copy the file)
git clone https://github.com/CrisisCore-Systems/pain-tracker.git /tmp/pt-repo

# Copy nginx config
sudo cp /tmp/pt-repo/deployment/nginx/pain-tracker /etc/nginx/sites-available/

# Edit the config to add your domain
sudo nano /etc/nginx/sites-available/pain-tracker
# Replace 'your.domain.example' with your actual domain

# Enable the site
sudo ln -s /etc/nginx/sites-available/pain-tracker /etc/nginx/sites-enabled/

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx

# Cleanup
rm -rf /tmp/pt-repo
```

5. **Point DNS to VM**

In your DNS provider (Cloudflare recommended):
```
Type: A
Name: @ (or subdomain)
Value: YOUR_VM_IP
TTL: Auto
Proxy: Yes (if using Cloudflare)
```

Wait 5-30 minutes for DNS propagation. Test with:
```bash
dig your.domain.example
# or
nslookup your.domain.example
```

6. **Issue SSL Certificate**

After DNS propagates, on the **remote VM**:
```bash
# Run certbot
sudo certbot --nginx -d your.domain.example

# Certbot will:
# 1. Verify domain ownership
# 2. Issue certificate
# 3. Modify nginx config (or you can do it manually)

# Uncomment HTTPS block in nginx config
sudo nano /etc/nginx/sites-available/pain-tracker
# Remove # from line 22 onwards (the HTTPS server block)

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

7. **Deploy Application**

Push to main branch to trigger deployment:
```bash
git add .
git commit -m "Enable Ubuntu VM deployment"
git push origin main
```

GitHub Actions will:
- Build the React app
- Create `release.tar.gz`
- Deploy to `/srv/pain-tracker`
- Reload nginx

8. **Verify Deployment**

```bash
# Check health endpoint
curl https://your.domain.example/healthz
# Should return: {"status":"ok","timestamp":"..."}

# Check readiness endpoint
curl https://your.domain.example/ready
# Should return: {"status":"ready",...}

# Visit in browser
open https://your.domain.example
```

## 📋 Detailed Configuration

### File Structure on Remote VM

```
/srv/pain-tracker/           # Main application directory
├── index.html               # React SPA entry point
├── assets/                  # JS, CSS, images
│   ├── index-*.js
│   ├── index-*.css
│   └── ...
├── health/                  # Health check endpoints
│   ├── healthz.json
│   └── ready.json
├── manifest.json            # PWA manifest
└── ...

/etc/nginx/sites-available/pain-tracker  # Nginx config
/etc/logrotate.d/pain-tracker           # Log rotation
/var/log/nginx/pain-tracker-*.log       # Application logs
```

### Health Endpoints

**Liveness Check** (`/healthz`):
- Returns 200 if nginx is serving files
- Used by UptimeRobot and load balancers

**Readiness Check** (`/ready`):
- Returns 200 if application is fully operational
- Includes timestamp and basic checks

Example response:
```json
{
  "status": "ready",
  "timestamp": "2024-11-16T16:45:00Z",
  "checks": {
    "static_files": "ok"
  }
}
```

### GitHub Actions Workflow

The workflow (`.github/workflows/deploy-ubuntu-vm.yml`) runs on every push to `main`:

1. **Build Phase** (GitHub Runner)
   - Checkout code
   - Install dependencies
   - Run tests
   - Build static files with Vite
   - Add health check files
   - Create tarball

2. **Deploy Phase** (SSH to VM)
   - Backup current deployment
   - Extract new files to `/srv/pain-tracker`
   - Set correct permissions
   - Reload nginx
   - Cleanup old backups

3. **Verify Phase**
   - Health check HTTP request
   - Confirms deployment success

### Backup Strategy

The backup script (`scripts/deployment/backup.sh`) includes:

- Static site files (`/srv/pain-tracker`)
- Nginx configuration
- SSL certificates
- Nginx logs (last 7 days)

**Setup Automated Backups**:

On the **remote VM** as deploy user:
```bash
# Configure rclone for Google Drive
rclone config
# Follow prompts to setup "gdrive" remote

# Test backup script
bash /srv/pain-tracker/scripts/deployment/backup.sh

# Add to crontab for daily 2am backups
crontab -e
# Add this line:
0 2 * * * /srv/pain-tracker/scripts/deployment/backup.sh >> /var/log/pain-tracker-backup.log 2>&1
```

Backups are stored in Google Drive at `backups/pain-tracker/` and automatically cleaned after 30 days.

### Monitoring Setup

#### 1. Netdata (System Metrics)

Already installed by bootstrap script. Access at: `http://YOUR_VM_IP:19999`

**Connect to Netdata Cloud** (for alerts):
```bash
# On remote VM
sudo netdata-claim.sh
# Follow prompts to link to Netdata Cloud account
```

Configure alerts in Netdata Cloud for:
- CPU usage > 80%
- Memory usage > 90%
- Disk usage > 85%
- Nginx service down

#### 2. UptimeRobot (Uptime Monitoring)

1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free)
2. Create new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your.domain.example/healthz`
   - **Interval**: 5 minutes
   - **Alert Contacts**: Your email/Slack
3. Expected response: Status 200 with `"status":"ok"`

#### 3. Cloudflare Analytics (Optional)

If using Cloudflare for DNS:
- Enable "Web Analytics" in Cloudflare dashboard
- View traffic, threats, and performance metrics
- Free tier includes basic DDoS protection

### Logging

Nginx logs are stored in:
- **Access**: `/var/log/nginx/pain-tracker-access.log`
- **Error**: `/var/log/nginx/pain-tracker-error.log`

**View logs**:
```bash
# Real-time access log
sudo tail -f /var/log/nginx/pain-tracker-access.log

# Real-time error log
sudo tail -f /var/log/nginx/pain-tracker-error.log

# Search for errors
sudo grep "error" /var/log/nginx/pain-tracker-error.log
```

**Log rotation** is automatic (configured in `/etc/logrotate.d/pain-tracker`):
- Daily rotation
- Keep 14 days
- Compress old logs

## 🔧 Maintenance

### Update Application

Simply push to main branch:
```bash
git push origin main
```

GitHub Actions handles the rest.

### Manual Deployment

If GitHub Actions is unavailable:
```bash
# On local machine
npm run build
tar -czf release.tar.gz -C dist .
scp release.tar.gz deploy@your.domain.example:/tmp/

# On remote VM
ssh deploy@your.domain.example
sudo tar -xzf /tmp/release.tar.gz -C /srv/pain-tracker
sudo chown -R www-data:www-data /srv/pain-tracker
sudo systemctl reload nginx
```

### Rollback Deployment

Backups are stored in `/srv/pain-tracker-backups/`:
```bash
# On remote VM
# List available backups
ls -lh /srv/pain-tracker-backups/

# Rollback to previous version
sudo tar -xzf /srv/pain-tracker-backups/backup-YYYYMMDD-HHMMSS.tar.gz -C /srv
sudo systemctl reload nginx
```

### SSL Certificate Renewal

Certbot auto-renews certificates. To test renewal:
```bash
sudo certbot renew --dry-run
```

Certbot creates a systemd timer that checks daily.

### Security Updates

```bash
# On remote VM
sudo apt update
sudo apt upgrade -y

# Reboot if kernel updated
sudo reboot
```

Setup automatic security updates:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 🐛 Troubleshooting

### Deployment Fails

**Check GitHub Actions logs**:
1. Go to repository → Actions tab
2. Click on failed workflow run
3. Expand failed step

**Common issues**:
- SSH key incorrect: Verify `SSH_PRIVATE_KEY` secret
- Host unreachable: Check VM firewall and `DEPLOY_HOST`
- Permission denied: Verify deploy user has sudo access

### Nginx Won't Start

```bash
# Check nginx config syntax
sudo nginx -t

# View nginx error log
sudo journalctl -u nginx -n 50

# Common fixes:
# - Port 80/443 already in use
# - Invalid config syntax
# - SSL certificate paths wrong
```

### Site Not Accessible

```bash
# Check nginx is running
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Check DNS
dig your.domain.example

# Check SSL
curl -v https://your.domain.example
```

### Health Checks Failing

```bash
# Verify health files exist
ls -la /srv/pain-tracker/health/

# Test locally on VM
curl localhost/healthz

# Check nginx config
sudo nginx -t
```

## 📊 Performance Optimization

### Enable Cloudflare Caching

If using Cloudflare:
1. Enable "Auto Minify" (CSS, JS, HTML)
2. Enable "Brotli" compression
3. Set caching level to "Standard"
4. Enable "Always Online"

### Nginx Tuning (for high traffic)

Edit `/etc/nginx/sites-available/pain-tracker`:
```nginx
# Add inside server block
client_max_body_size 10M;
keepalive_timeout 65;
gzip_comp_level 6;
```

### Monitor Performance

Use Netdata to watch:
- CPU usage during deployments
- Memory consumption
- Disk I/O
- Network bandwidth

## 🔐 Security Hardening

### SSH Hardening

Edit `/etc/ssh/sshd_config`:
```bash
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Reload SSH:
```bash
sudo systemctl reload sshd
```

### Fail2Ban

Install fail2ban to prevent brute force:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Regular Updates

Add to crontab:
```bash
# Weekly security updates (Sunday 3am)
0 3 * * 0 apt update && apt upgrade -y >> /var/log/apt-auto-upgrade.log 2>&1
```

## 💡 Tips & Best Practices

### Keep Laptop Light

- **Don't run**: `npm run dev`, Docker, or any servers locally
- **Only use**: VS Code/editor and git commands
- **All builds**: Happen on GitHub Actions runners
- **All hosting**: Happens on remote VM

### Cost Management

**Oracle Cloud Always Free**:
- 2 AMD VMs (1/8 OCPU, 1GB RAM each)
- OR 4 Arm VMs (1 OCPU, 6GB RAM each)
- 200GB block storage
- 10TB/month outbound transfer

Stays **free forever** if you:
- Log in once every ~60 days
- Don't exceed quotas
- Keep "Always Free" tier resources

### Development Workflow

```bash
# 1. Make changes locally
code src/components/MyComponent.tsx

# 2. Test locally (optional)
npm run dev  # Runs on laptop temporarily

# 3. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin main

# 4. GitHub Actions deploys automatically
# 5. Visit https://your.domain.example to see changes
```

## 📚 Additional Resources

- [Oracle Cloud Always Free Tier](https://www.oracle.com/cloud/free/)
- [Certbot Documentation](https://certbot.eff.org/)
- [Nginx Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html)
- [Netdata Documentation](https://learn.netdata.cloud/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Free Plan](https://www.cloudflare.com/plans/free/)

## ❓ FAQ

**Q: Can I use a different cloud provider?**  
A: Yes! Any Ubuntu 22.04 VM works (AWS, GCP, Azure, DigitalOcean, Linode, etc.)

**Q: Do I need a domain for HTTPS?**  
A: Yes, Let's Encrypt requires a domain. Use a free subdomain from services like FreeDNS if needed.

**Q: Can I deploy to multiple VMs?**  
A: Yes, add more secrets (`DEPLOY_HOST_2`, etc.) and duplicate the deploy step in workflow.

**Q: What if I want to use a different port?**  
A: Edit nginx config to change `listen 80/443` to your desired ports, update firewall rules.

**Q: How do I add environment variables?**  
A: React apps use build-time env vars. Add them to `.env` files or GitHub Actions workflow.

**Q: Can I preview changes before deploying?**  
A: Yes, create a staging branch and duplicate the workflow with different `DEPLOY_HOST_STAGING` secret.

---

**Deployment Status**: Ready for production  
**Last Updated**: November 2024  
**Maintainer**: CrisisCore-Systems
