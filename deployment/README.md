# Deployment Files

This directory contains configuration files for deploying Pain Tracker to a remote Ubuntu 22.04 VM.

## 📁 Directory Structure

```
deployment/
├── nginx/
│   └── pain-tracker          # Nginx configuration for hosting the SPA
├── health/
│   ├── healthz.json          # Liveness check endpoint
│   └── ready.json            # Readiness check endpoint
└── logrotate/
    └── pain-tracker          # Log rotation configuration
```

## 🚀 Quick Start

See the comprehensive guides:
- **Full Guide**: [docs/ops/UBUNTU_VM_DEPLOYMENT.md](../docs/ops/UBUNTU_VM_DEPLOYMENT.md)
- **Quick Reference**: [docs/ops/UBUNTU_VM_QUICKSTART.md](../docs/ops/UBUNTU_VM_QUICKSTART.md)

Or run the bootstrap script:
```bash
curl -fsSL https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/scripts/deployment/bootstrap-ubuntu-vm.sh | bash
```

## 📄 File Descriptions

### nginx/pain-tracker

Nginx configuration for serving the Pain Tracker React SPA with:
- HTTP (port 80) for initial setup and ACME challenges
- HTTPS (port 443) with SSL/TLS termination
- Static file serving from `/srv/pain-tracker`
- Gzip compression for assets
- SPA routing (all routes serve `index.html`)
- Health check endpoints
- Security headers (HSTS, X-Frame-Options, CSP, etc.)
- Caching for static assets

**Installation**:
```bash
sudo cp deployment/nginx/pain-tracker /etc/nginx/sites-available/
sudo nano /etc/nginx/sites-available/pain-tracker  # Edit domain name
sudo ln -s /etc/nginx/sites-available/pain-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### health/healthz.json

Simple liveness check endpoint. Returns 200 OK if nginx is serving files.

Used by:
- UptimeRobot for uptime monitoring
- Load balancers for instance health
- Kubernetes-style health checks

Example response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-16T16:45:00Z"
}
```

### health/ready.json

Readiness check endpoint. Returns 200 OK when application is fully ready to serve traffic.

For a static site, this is equivalent to liveness, but the structure allows for future expansion (e.g., checking API availability).

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

### logrotate/pain-tracker

Logrotate configuration for Nginx logs:
- Rotates logs daily
- Keeps 14 days of history
- Compresses old logs (gzip)
- Sends USR1 signal to Nginx to reopen log files
- Handles missing logs gracefully

**Installation**:
```bash
sudo cp deployment/logrotate/pain-tracker /etc/logrotate.d/
```

Logs are stored at:
- `/var/log/nginx/pain-tracker-access.log`
- `/var/log/nginx/pain-tracker-error.log`

## 🔧 Deployment Workflow

1. **Bootstrap VM**: Run `scripts/deployment/bootstrap-ubuntu-vm.sh`
2. **Configure Nginx**: Install and customize nginx config
3. **Setup DNS**: Point domain to VM IP
4. **Issue SSL**: Run certbot for HTTPS
5. **Configure GitHub**: Add SSH secrets
6. **Deploy**: Push to main branch

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy-ubuntu-vm.yml`) automatically:
1. Builds the React app with Vite
2. Creates health check files
3. Packages everything as `release.tar.gz`
4. Deploys to `/srv/pain-tracker` via SSH
5. Reloads nginx
6. Verifies with health check

## 🔐 Security Features

- **TLS 1.2/1.3** only with strong ciphers
- **HSTS** (HTTP Strict Transport Security)
- **CSP** (Content Security Policy) headers
- **X-Frame-Options** to prevent clickjacking
- **X-Content-Type-Options** to prevent MIME sniffing
- **SSH key-based deployment** (no passwords)
- **Limited sudo permissions** for deploy user
- **UFW firewall** (ports 22, 80, 443 only)

## 📊 Monitoring

Health endpoints support monitoring via:

- **UptimeRobot**: Check `https://your.domain.example/healthz` every 5 minutes
- **Netdata**: System metrics at `http://YOUR_VM_IP:19999`
- **Cloudflare Analytics**: Traffic and threat monitoring (if using Cloudflare)

## 🗄️ Backups

The backup script (`scripts/deployment/backup.sh`) backs up:
- Static site files from `/srv/pain-tracker`
- Nginx configuration
- SSL certificates
- Recent access/error logs

Backups are uploaded to Google Drive via rclone and kept for 30 days.

**Setup**:
```bash
# Configure rclone
rclone config  # Setup 'gdrive' remote

# Test backup
bash scripts/deployment/backup.sh

# Schedule daily backups at 2am
crontab -e
# Add: 0 2 * * * /srv/pain-tracker/scripts/deployment/backup.sh >> /var/log/pain-tracker-backup.log 2>&1
```

## 📚 Related Documentation

- [Ubuntu VM Deployment Guide](../docs/ops/UBUNTU_VM_DEPLOYMENT.md) - Comprehensive setup guide
- [Quick Reference](../docs/ops/UBUNTU_VM_QUICKSTART.md) - One-page cheat sheet
- [Main README](../README.md) - Project overview
- [Deployment Guide](../docs/ops/DEPLOYMENT_GUIDE.md) - Vercel/other platform deployment

## 🆘 Support

Issues with deployment? Check:
1. [Troubleshooting section](../docs/ops/UBUNTU_VM_DEPLOYMENT.md#-troubleshooting) in the deployment guide
2. Nginx logs: `sudo tail -f /var/log/nginx/pain-tracker-error.log`
3. GitHub Actions logs in the repository
4. [Open an issue](https://github.com/CrisisCore-Systems/pain-tracker/issues) if problems persist
