# NGROK Setup Guide for Local Payment Testing

## What is ngrok?
ngrok creates a secure public URL that tunnels to your local development server. This allows you to test payment callbacks and webhooks locally without deploying to production.

## Installation

### 1. Install ngrok globally (already done ✓)
```bash
npm install -g ngrok
```

### 2. Authenticate ngrok (One-time setup)
```bash
ngrok authtoken YOUR_AUTH_TOKEN
```

Get your free authtoken from: https://dashboard.ngrok.com/auth

## Quick Start Guide

### Step 1: Start the Webhook Server
```bash
npx ts-node webhook-server.ts
```

You should see:
```
🚀 Server running on http://localhost:3001
📋 Available endpoints:
   - POST http://localhost:3001/api/khalti-webhook
   - GET  http://localhost:3001/api/test
   - GET  http://localhost:3001/health
```

### Step 2: Start ngrok in Another Terminal
```bash
ngrok http 3001
```

You'll see output like:
```
ngrok running...
Forwarding    https://abc123def456.ngrok.io -> http://localhost:3001
```

**Copy the ngrok URL:** `https://abc123def456.ngrok.io`

### Step 3: Use ngrok URL for Khalti Callback

In your PaymentPage, update the callback URL:
```javascript
const KHALTI_CALLBACK_URL = 'https://your-ngrok-url.ngrok.io/api/khalti-webhook';
```

### Step 4: Test Payment Flow

1. Initiate payment in the Expo app
2. Khalti will send payment callback to your ngrok URL
3. Check the webhook server logs to see the callback data
4. Verify the email is sent

## Webhook Endpoints

### POST /api/khalti-webhook
Receives Khalti payment callbacks
- **Body**: `{ pidx, status, transaction_id }`
- **Response**: Success/failure status

Example callback:
```json
{
  "pidx": "1234567890",
  "status": "Completed",
  "transaction_id": "transid123"
}
```

### GET /api/test
Test the server is running

Response:
```json
{
  "message": "✅ Server is running!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "ngrokUrl": "Use ngrok URL as your Khalti callback"
}
```

### GET /health
Health check endpoint

Response:
```json
{
  "status": "OK",
  "uptime": 123.456
}
```

## Complete Testing Workflow

### Terminal 1: Start the Webhook Server
```bash
cd c:\fyp\NAVALOK-WATERWORLD-main
npx ts-node webhook-server.ts
```

### Terminal 2: Start ngrok
```bash
ngrok http 3001
```

### Terminal 3: Start Expo App
```bash
cd c:\fyp\NAVALOK-WATERWORLD-main
npm start
```

### Testing Steps:
1. Open the app on your device
2. Initiate a payment
3. Complete payment in Khalti
4. Khalti calls back to your ngrok URL
5. Check Terminal 1 for webhook logs
6. Verify email was sent (check Cloud Functions logs)

## Tunnel URL Changes

⚠️ **Important**: The ngrok URL changes each time you restart ngrok. You'll need to:
1. Update the callback URL in `PaymentPage.tsx`
2. Or use a custom domain with ngrok (paid feature)

## Advanced: Using Environment Variables

Create a `.env` file:
```
NGROK_URL=https://your-ngrok-url.ngrok.io
KHALTI_CALLBACK_URL=${NGROK_URL}/api/khalti-webhook
```

## Troubleshooting

### ngrok command not found
- Make sure ngrok is installed globally: `npm install -g ngrok`
- Or use `npx ngrok@latest http 3001`

### Webhook not being called
- Check the ngrok URL is correct in PaymentPage
- Verify Khalti has the correct callback URL
- Check firewall/security settings

### CORS errors
- Ensure `cors()` middleware is enabled in webhook server ✓
- Check CORS headers in response

### Logs not showing
- Verify webhook server is running on port 3001 ✓
- Check ngrok is forwarding to correct port ✓

## Viewing Webhook Details

ngrok provides a web interface at: http://localhost:4040

You can see all requests/responses in real-time:
- Request headers
- Request body
- Response status
- Timing information

## Using ngrok with Custom Domain (Paid)

If you want a stable URL:
1. Upgrade to ngrok paid plan
2. Reserve a custom domain
3. Use: `ngrok http 3001 --domain your-domain.ngrok.io`

## Security Notes

- ngrok URLs are public during testing
- Don't commit URLs to version control
- Change URLs after testing
- Use environment variables for sensitive data

## Next Steps

1. ✅ ngrok installed
2. ⏭️ Create webhook server (provided)
3. ⏭️ Start ngrok tunnel
4. ⏭️ Test payment flow
5. ⏭️ Verify emails are sent

---

**Test locally before deploying to production!**
