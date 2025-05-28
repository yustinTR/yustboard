#!/bin/bash

# Deployment script voor Yustboard op Plesk VPS
# Gebruik: ./deploy.sh

echo "🚀 Starting deployment..."

# Pull laatste changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build de applicatie
echo "🏗️ Building application..."
npm run build

# Restart de applicatie via PM2 (als je PM2 gebruikt)
# pm2 restart yustboard

echo "✅ Deployment complete!"
echo "⚠️  Vergeet niet de applicatie te herstarten in Plesk Node.js panel!"