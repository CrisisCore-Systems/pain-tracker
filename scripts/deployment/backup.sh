#!/usr/bin/env bash
# Offsite backup for Pain Tracker static site
# Backs up static files, nginx config, and SSL certificates
# Configure rclone remote as "gdrive" via `rclone config` on the remote VM
set -euo pipefail

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
TMPDIR="/tmp/pain-tracker-backup-$TIMESTAMP"
mkdir -p "$TMPDIR"

echo "Starting Pain Tracker backup at $TIMESTAMP"

# Backup static site files
if [ -d /srv/pain-tracker ]; then
  echo "Backing up static site files..."
  tar -czf "$TMPDIR/pain-tracker-site-$TIMESTAMP.tar.gz" -C /srv pain-tracker
fi

# Backup nginx configuration
if [ -f /etc/nginx/sites-available/pain-tracker ]; then
  echo "Backing up nginx configuration..."
  sudo cp /etc/nginx/sites-available/pain-tracker "$TMPDIR/nginx-pain-tracker-$TIMESTAMP.conf"
fi

# Backup SSL certificates (if they exist)
if [ -d /etc/letsencrypt/live ]; then
  echo "Backing up SSL certificates..."
  sudo tar -czf "$TMPDIR/letsencrypt-$TIMESTAMP.tar.gz" -C /etc letsencrypt || true
fi

# Backup nginx logs (last 7 days)
if [ -f /var/log/nginx/pain-tracker-access.log ]; then
  echo "Backing up nginx logs..."
  sudo cp /var/log/nginx/pain-tracker-access.log "$TMPDIR/access-$TIMESTAMP.log" || true
  sudo cp /var/log/nginx/pain-tracker-error.log "$TMPDIR/error-$TIMESTAMP.log" || true
fi

# Fix permissions so rclone can read the files
sudo chown -R $USER:$USER "$TMPDIR"

# Upload to Google Drive using rclone
echo "Uploading to Google Drive..."
rclone copy "$TMPDIR" gdrive:backups/pain-tracker --transfers=4 --create-empty-src-dirs

echo "Backup uploaded successfully"

# Cleanup local backup
rm -rf "$TMPDIR"

# Keep only last 30 days of backups in Google Drive
echo "Cleaning old backups from Google Drive..."
rclone delete gdrive:backups/pain-tracker --min-age 30d --rmdirs || true

echo "Backup complete!"
