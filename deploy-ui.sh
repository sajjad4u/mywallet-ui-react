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
  --deployment-token "2dae185cf2bee906794c7b833e147e771acde89c6f8a7f171818464a21de2bb002-ba439de5-a722-4047-8500-efb9d858dab70101811077315d10"

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🔗 Your React app is available at:"
echo "   https://delightful-forest-077315d10.2.azurestaticapps.net"
echo ""
echo "📊 Application endpoints:"
echo "   - Home Page:     https://delightful-forest-077315d10.2.azurestaticapps.net/"
echo "   - Account:       https://delightful-forest-077315d10.2.azurestaticapps.net/account"
echo "   - Categories:    https://delightful-forest-077315d10.2.azurestaticapps.net/category"
echo "   - Transactions:  https://delightful-forest-077315d10.2.azurestaticapps.net/transaction"
echo ""
echo "🔄 API calls will be proxied to:"
echo "   https://mywallet-api-b9h6fzh9aue0f0gv.westcentralus-01.azurewebsites.net/mywallet/"
echo ""
echo "💡 To test the frontend-backend integration:"
echo "   1. Open the React app in your browser"
echo "   2. Navigate to the Transaction page"
echo "   3. Try creating a new transaction"
echo "   4. Check if API calls are working properly"
