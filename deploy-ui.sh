#!/bin/bash

# MyWallet React UI Deployment Script for Azure Static Web Apps
# This script builds and deploys the React frontend to Azure

set -e  # Exit on any error

echo "🚀 Starting React UI deployment process..."

# Build the application
echo "📦 Building React application..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Build directory 'dist' not found"
    exit 1
fi

echo "📁 Build directory contents:"
ls -la dist/

# Deploy using Azure Static Web Apps CLI
echo "🚀 Deploying to Azure Static Web Apps..."
npx @azure/static-web-apps-cli deploy \
  --app-location ./dist \
  --deployment-token "2703e3168f0c16b8cfae7216509b1c5eacb412b09c2d53ce653764405203ec9a02-c5408311-4e3e-48bf-9abc-a869e9695d3901009160151be210"

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🔗 Your React app is available at:"
echo "   https://purple-mushroom-0151be210.2.azurestaticapps.net"
echo ""
echo "📊 Application endpoints:"
echo "   - Home Page:     https://purple-mushroom-0151be210.2.azurestaticapps.net/"
echo "   - Account:       https://purple-mushroom-0151be210.2.azurestaticapps.net/account"
echo "   - Categories:    https://purple-mushroom-0151be210.2.azurestaticapps.net/category"
echo "   - Transactions:  https://purple-mushroom-0151be210.2.azurestaticapps.net/transaction"
echo ""
echo "🔄 API calls will be proxied to:"
echo "   https://mywallet-api-b9h6fzh9aue0f0gv.westcentralus-01.azurewebsites.net/mywallet/"
echo ""
echo "💡 To test the frontend-backend integration:"
echo "   1. Open the React app in your browser"
echo "   2. Navigate to the Transaction page"
echo "   3. Try creating a new transaction"
echo "   4. Check if API calls are working properly"
