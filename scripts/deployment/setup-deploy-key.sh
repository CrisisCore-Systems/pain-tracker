#!/usr/bin/env bash
# Helper script to generate SSH deploy key and show GitHub secrets setup
# Run this on your LOCAL machine (not the remote VM)
set -euo pipefail

echo "=========================================="
echo "Pain Tracker - Deploy Key Generator"
echo "=========================================="
echo ""

# Default key path
KEY_PATH="$HOME/.ssh/pain-tracker-deploy"

# Check if key already exists
if [ -f "$KEY_PATH" ]; then
    echo "⚠️  SSH key already exists at: $KEY_PATH"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing key."
    else
        echo "Generating new key..."
        ssh-keygen -t ed25519 -C "pain-tracker-deploy" -f "$KEY_PATH" -N ""
        echo "✓ New key generated"
    fi
else
    echo "Generating SSH key pair..."
    ssh-keygen -t ed25519 -C "pain-tracker-deploy" -f "$KEY_PATH" -N ""
    echo "✓ Key generated at: $KEY_PATH"
fi

echo ""
echo "=========================================="
echo "Step 1: Copy Public Key to Remote VM"
echo "=========================================="
echo ""
echo "Enter your VM details:"
read -p "Deploy user (default: deploy): " DEPLOY_USER
DEPLOY_USER=${DEPLOY_USER:-deploy}

read -p "VM IP or hostname: " VM_HOST

if [ -z "$VM_HOST" ]; then
    echo "Error: VM host is required"
    exit 1
fi

echo ""
echo "Copying public key to $DEPLOY_USER@$VM_HOST..."
ssh-copy-id -i "$KEY_PATH.pub" "$DEPLOY_USER@$VM_HOST" || {
    echo ""
    echo "❌ Failed to copy key automatically"
    echo ""
    echo "Manual method:"
    echo "1. Copy this public key:"
    echo ""
    cat "$KEY_PATH.pub"
    echo ""
    echo "2. SSH to your VM and run:"
    echo "   mkdir -p ~/.ssh"
    echo "   chmod 700 ~/.ssh"
    echo "   echo 'PASTE_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys"
    echo "   chmod 600 ~/.ssh/authorized_keys"
    echo ""
    read -p "Press Enter when ready to continue..."
}

echo ""
echo "Testing SSH connection..."
if ssh -i "$KEY_PATH" -o BatchMode=yes -o StrictHostKeyChecking=no "$DEPLOY_USER@$VM_HOST" "echo '✓ SSH connection successful'" 2>/dev/null; then
    echo "✓ SSH key authentication works!"
else
    echo "⚠️  Could not verify SSH connection. Please test manually:"
    echo "   ssh -i $KEY_PATH $DEPLOY_USER@$VM_HOST"
fi

echo ""
echo "=========================================="
echo "Step 2: GitHub Secrets Configuration"
echo "=========================================="
echo ""
echo "Add these secrets to your GitHub repository:"
echo ""
echo "Repository → Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "──────────────────────────────────────────"
echo "Secret Name: SSH_PRIVATE_KEY"
echo "──────────────────────────────────────────"
echo "Value (copy everything below, including the BEGIN/END lines):"
echo ""
cat "$KEY_PATH"
echo ""
echo "──────────────────────────────────────────"
echo "Secret Name: DEPLOY_USER"
echo "──────────────────────────────────────────"
echo "Value: $DEPLOY_USER"
echo ""
echo "──────────────────────────────────────────"
echo "Secret Name: DEPLOY_HOST"
echo "──────────────────────────────────────────"
echo "Value: $VM_HOST"
echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "✓ SSH key generated at: $KEY_PATH"
echo "✓ Public key: $KEY_PATH.pub"
echo "✓ Deploy user: $DEPLOY_USER"
echo "✓ VM host: $VM_HOST"
echo ""
echo "Next Steps:"
echo "1. Add the three secrets to GitHub (see above)"
echo "2. Ensure nginx is configured on the VM"
echo "3. Push to main branch to trigger deployment"
echo ""
echo "Test deployment manually:"
echo "  git add ."
echo "  git commit -m 'test: trigger deployment'"
echo "  git push origin main"
echo ""
echo "Monitor deployment:"
echo "  https://github.com/YOUR_USERNAME/pain-tracker/actions"
echo ""
