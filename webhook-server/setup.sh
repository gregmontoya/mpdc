#!/bin/bash

echo "🚀 MPDC Webhook Server - Quick Start"
echo "===================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create users.json if it doesn't exist
if [ ! -f "users.json" ]; then
    echo '{"users":[]}' > users.json
    echo "✅ Created users.json database"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in .env file (see DEPLOYMENT_GUIDE.md)"
echo "2. Run 'npm start' to start the server"
echo "3. Test with Stripe CLI or deploy to Vercel"
echo ""
echo "For full deployment instructions, see DEPLOYMENT_GUIDE.md"
