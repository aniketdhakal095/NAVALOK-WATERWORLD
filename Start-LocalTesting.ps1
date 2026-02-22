# Quick start script for testing with ngrok (Windows PowerShell)

Write-Host "`n🚀 Starting Navalok Local Testing with ngrok" -ForegroundColor Green
Write-Host ""

# Check if ngrok is installed
try {
    $null = ngrok --version
}
catch {
    Write-Host "❌ ngrok is not installed. Installing..." -ForegroundColor Red
    npm install -g ngrok
}

# Colors
$header = "================================================"

Write-Host $header -ForegroundColor Cyan
Write-Host "System: Navalok Fresh Farm - Local Testing" -ForegroundColor Green
Write-Host $header -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Starting Components:" -ForegroundColor Yellow
Write-Host ""

# Terminal 1: Webhook Server
Write-Host "[1/3] " -ForegroundColor Green -NoNewline
Write-Host "Starting Webhook Server on port 3001..."
Write-Host "Run in Terminal 1:" -ForegroundColor Yellow
Write-Host "  npx ts-node webhook-server.ts" -ForegroundColor Cyan
Write-Host ""

# Terminal 2: ngrok
Write-Host "[2/3] " -ForegroundColor Green -NoNewline
Write-Host "Starting ngrok tunnel..."
Write-Host "Run in Terminal 2:" -ForegroundColor Yellow
Write-Host "  ngrok http 3001" -ForegroundColor Cyan
Write-Host ""

# Terminal 3: Expo
Write-Host "[3/3] " -ForegroundColor Green -NoNewline
Write-Host "Starting Expo development server..."
Write-Host "Run in Terminal 3:" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host ""

Write-Host $header -ForegroundColor Cyan
Write-Host "📌 IMPORTANT STEPS:" -ForegroundColor Yellow
Write-Host $header -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Start webhook server (Terminal 1)" -ForegroundColor White
Write-Host "   Command: npx ts-node webhook-server.ts" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Start ngrok tunnel (Terminal 2)" -ForegroundColor White
Write-Host "   Command: ngrok http 3001" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Copy the ngrok URL from Terminal 2" -ForegroundColor White
Write-Host "   It will look like: " -ForegroundColor White -NoNewline
Write-Host "https://abc123def456.ngrok.io" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. Update PaymentPage SUCCESS_URL temporarily:" -ForegroundColor White
Write-Host "   const SUCCESS_URL = 'https://your-ngrok-url/api/khalti-webhook';" -ForegroundColor Cyan
Write-Host ""

Write-Host "5. Start Expo app (Terminal 3)" -ForegroundColor White
Write-Host "   Command: npm start" -ForegroundColor Cyan
Write-Host ""

Write-Host "6. Test the payment flow in your app" -ForegroundColor White
Write-Host ""

Write-Host $header -ForegroundColor Cyan
Write-Host "🔗 Useful URLs:" -ForegroundColor Yellow
Write-Host $header -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 ngrok Web Dashboard: " -ForegroundColor White -NoNewline
Write-Host "http://localhost:4040" -ForegroundColor Cyan
Write-Host "🧪 Test Endpoint: " -ForegroundColor White -NoNewline
Write-Host "https://your-ngrok-url/api/test" -ForegroundColor Cyan
Write-Host "❤️ Health Check: " -ForegroundColor White -NoNewline
Write-Host "https://your-ngrok-url/health" -ForegroundColor Cyan
Write-Host ""

Write-Host $header -ForegroundColor Cyan
Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host $header -ForegroundColor Cyan
Write-Host ""

Write-Host "Full setup guide: " -ForegroundColor White -NoNewline
Write-Host "./NGROK_SETUP.md" -ForegroundColor Cyan
Write-Host "Email setup guide: " -ForegroundColor White -NoNewline
Write-Host "./EMAIL_SETUP.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press Enter to continue..." -ForegroundColor Yellow
Read-Host
