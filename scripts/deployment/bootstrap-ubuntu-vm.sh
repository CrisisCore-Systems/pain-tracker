#!/usr/bin/env bash
# One-shot bootstrap script for Pain Tracker on Ubuntu 22.04 VM
# Run as a user with sudo privileges
# This sets up nginx, certbot, node for builds, creates deploy user, and installs monitoring
set -euo pipefail

echo "=========================================="
echo "Pain Tracker Ubuntu 22.04 Bootstrap"
echo "=========================================="
echo ""

# Check if running on Ubuntu
if [ ! -f /etc/os-release ]; then
    echo "Error: Cannot determine OS version"
    exit 1
fi

. /etc/os-release
if [ "$ID" != "ubuntu" ]; then
    echo "Warning: This script is designed for Ubuntu. Detected: $ID"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Step 1: System Update"
echo "---------------------"
sudo apt update && sudo apt upgrade -y

echo ""
echo "Step 2: Install nginx and certbot"
echo "-----------------------------------"
sudo apt install -y nginx certbot python3-certbot-nginx

echo ""
echo "Step 3: Install Node.js 20 for CI/CD builds"
echo "--------------------------------------------"
# Install Node.js 20 (matching project requirement)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo ""
echo "Step 4: Install additional tools"
echo "---------------------------------"
sudo apt install -y git build-essential rclone ufw curl

echo ""
echo "Step 5: Create directories"
echo "--------------------------"
sudo mkdir -p /var/www/certbot
sudo mkdir -p /srv/pain-tracker
sudo mkdir -p /srv/pain-tracker-backups
sudo mkdir -p /var/log/nginx
sudo chown -R www-data:www-data /srv/pain-tracker /srv/pain-tracker-backups /var/www/certbot

echo ""
echo "Step 6: Create deploy user"
echo "--------------------------"
DEPLOY_USER="deploy"
if ! id -u "$DEPLOY_USER" >/dev/null 2>&1; then
  sudo adduser --disabled-password --gecos "" "$DEPLOY_USER"
  sudo usermod -aG sudo "$DEPLOY_USER"
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /bin/tar, /bin/mkdir, /bin/chown, /usr/sbin/nginx, /bin/systemctl" | sudo tee /etc/sudoers.d/deploy-pain-tracker
  sudo chmod 0440 /etc/sudoers.d/deploy-pain-tracker
  echo "✓ Created user: $DEPLOY_USER"
  echo "  Add your SSH public key to: /home/$DEPLOY_USER/.ssh/authorized_keys"
else
  echo "✓ User $DEPLOY_USER already exists"
fi

# Ensure SSH directory exists for deploy user
sudo mkdir -p /home/$DEPLOY_USER/.ssh
sudo chmod 700 /home/$DEPLOY_USER/.ssh
sudo chown $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh

echo ""
echo "Step 7: Configure UFW firewall"
echo "-------------------------------"
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
echo "✓ Firewall configured"

echo ""
echo "Step 8: Install Netdata (monitoring)"
echo "-------------------------------------"
if ! command -v netdata &> /dev/null; then
    # Install Netdata using kickstart script
    bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait --disable-telemetry || true
    echo "✓ Netdata installed"
    echo "  Access Netdata at: http://YOUR_IP:19999"
    echo "  To connect to Netdata Cloud, run: sudo netdata-claim.sh"
else
    echo "✓ Netdata already installed"
fi

echo ""
echo "Step 9: Configure nginx"
echo "-----------------------"
# Remove default site if it exists
if [ -L /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
    echo "✓ Removed default nginx site"
fi

echo ""
echo "=========================================="
echo "Bootstrap Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Add SSH Key for Deploy User"
echo "   Run on your LOCAL machine:"
echo "   ssh-keygen -t ed25519 -C 'pain-tracker-deploy' -f ~/.ssh/pain-tracker-deploy"
echo "   ssh-copy-id -i ~/.ssh/pain-tracker-deploy.pub $DEPLOY_USER@YOUR_VM_IP"
echo ""
echo "2. Configure Nginx"
echo "   Copy the nginx config file from the repo:"
echo "   sudo cp /path/to/repo/deployment/nginx/pain-tracker /etc/nginx/sites-available/"
echo "   Edit it and replace 'your.domain.example' with your actual domain"
echo "   sudo ln -s /etc/nginx/sites-available/pain-tracker /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "3. Point DNS to this VM"
echo "   Add an A record for your domain pointing to: $(curl -s ifconfig.me || echo 'YOUR_VM_IP')"
echo ""
echo "4. Issue SSL Certificate"
echo "   Wait for DNS propagation (5-30 minutes), then run:"
echo "   sudo certbot --nginx -d your.domain.example"
echo "   After certbot succeeds, uncomment the HTTPS block in /etc/nginx/sites-available/pain-tracker"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "5. Configure GitHub Actions Secrets"
echo "   In your GitHub repo, go to Settings → Secrets and variables → Actions"
echo "   Add these secrets:"
echo "     SSH_PRIVATE_KEY: Contents of ~/.ssh/pain-tracker-deploy (private key)"
echo "     DEPLOY_USER: deploy"
echo "     DEPLOY_HOST: your.domain.example"
echo ""
echo "6. Setup Backups (Optional)"
echo "   Configure rclone for Google Drive:"
echo "   rclone config"
echo "   Add a cron job to run backups daily:"
echo "   sudo crontab -e -u $DEPLOY_USER"
echo "   Add line: 0 2 * * * /srv/pain-tracker/scripts/deployment/backup.sh >> /var/log/pain-tracker-backup.log 2>&1"
echo ""
echo "7. Setup Monitoring (Optional)"
echo "   - UptimeRobot: Add monitor for https://your.domain.example/healthz"
echo "   - Netdata Cloud: Run 'sudo netdata-claim.sh' and follow prompts"
echo ""
echo "8. Install Logrotate Config"
echo "   sudo cp /path/to/repo/deployment/logrotate/pain-tracker /etc/logrotate.d/"
echo ""
echo "Current Server IP: $(curl -s ifconfig.me || echo 'Unable to detect')"
echo ""
