#!/bin/bash
# Quick start script for testing with ngrok

echo "🚀 Starting Navalok Local Testing with ngrok"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing..."
    npm install -g ngrok
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}System: Navalok Fresh Farm - Local Testing${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

echo -e "${YELLOW}📋 Starting Components:${NC}"
echo ""

# Terminal 1: Webhook Server
echo -e "${GREEN}[1/3]${NC} Starting Webhook Server on port 3001..."
echo "Run in Terminal 1:"
echo "  npx ts-node webhook-server.ts"
echo ""

# Terminal 2: ngrok
echo -e "${GREEN}[2/3]${NC} Starting ngrok tunnel..."
echo "Run in Terminal 2:"
echo "  ngrok http 3001"
echo ""

# Terminal 3: Expo
echo -e "${GREEN}[3/3]${NC} Starting Expo development server..."
echo "Run in Terminal 3:"
echo "  npm start"
echo ""

echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}📌 IMPORTANT STEPS:${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "1. Start webhook server (Terminal 1)"
echo "   Command: npx ts-node webhook-server.ts"
echo ""
echo "2. Start ngrok tunnel (Terminal 2)"
echo "   Command: ngrok http 3001"
echo ""
echo "3. Copy the ngrok URL from Terminal 2"
echo "   It will look like: https://abc123def456.ngrok.io"
echo ""
echo "4. Update PaymentPage SUCCESS_URL temporarily:"
echo "   const SUCCESS_URL = 'https://your-ngrok-url/api/khalti-webhook';"
echo ""
echo "5. Start Expo app (Terminal 3)"
echo "   Command: npm start"
echo ""
echo "6. Test the payment flow in your app"
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}🔗 Useful URLs:${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "📊 ngrok Web Dashboard: http://localhost:4040"
echo "🧪 Test Endpoint: https://your-ngrok-url/api/test"
echo "❤️ Health Check: https://your-ngrok-url/health"
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}📖 Documentation:${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Full setup guide: ./NGROK_SETUP.md"
echo "Email setup guide: ./EMAIL_SETUP.md"
echo ""
