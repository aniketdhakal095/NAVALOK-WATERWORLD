# NGROK + Local Testing - Quick Reference

## What You Have Now:
✅ ngrok installed globally
✅ Webhook server created (webhook-server.ts)
✅ Express server for receiving Khalti callbacks
✅ Testing scripts provided

## Quick Setup (5 minutes)

### Terminal 1: Webhook Server
```bash
cd c:\fyp\NAVALOK-WATERWORLD-main
npx ts-node webhook-server.ts
```

**Expected Output:**
```
🚀 Server running on http://localhost:3001
📋 Available endpoints:
   - POST http://localhost:3001/api/khalti-webhook
   - GET  http://localhost:3001/api/test
   - GET  http://localhost:3001/health
```

### Terminal 2: ngrok Tunnel
```bash
ngrok http 3001
```

**Expected Output:**
```
Session Status            online
Account                   your_account
Session Expires           1h 59m
Version                   3.x.x
Region                    us (United States)
Latency                   50ms
Web Interface             http://127.0.0.1:4040
Forwarding                https://abc123def456.ngrok.io -> http://localhost:3001
Connections              accept-encoding: gzip, deflate
```

**🔑 COPY THIS URL:** `https://abc123def456.ngrok.io`

### Terminal 3: Expo App
```bash
npm start
```

## Testing Payment Flow

### Option A: Quick Test (No Payment)
```bash
curl -X GET https://your-ngrok-url/api/test
```

You'll get:
```json
{
  "message": "✅ Server is running!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "ngrokUrl": "Use ngrok URL as your Khalti callback"
}
```

### Option B: Test Complete Payment Flow

1. **Update PaymentPage.tsx temporarily:**
```tsx
// TEMPORARY - for local testing with ngrok
const SUCCESS_URL = 'https://your-ngrok-url/api/khalti-webhook';
// After testing, change back to: 'https://example.com/khalti-success'
```

2. **In the app:**
   - Navigate to Payment Page
   - Click "Pay with Khalti"
   - Complete the Khalti payment
   - Khalti will callback to your ngrok URL

3. **Watch Terminal 1:**
   You should see webhook logs like:
   ```
   🔔 Khalti Webhook Received: {
     pidx: '1234567890',
     status: 'Completed',
     transaction_id: 'transid123'
   }
   ✅ Payment successful!
   ```

4. **Email Verification:**
   - Check Firebase Functions logs for email sending
   - Verify emails received in Gmail inbox

## Monitoring

### ngrok Web Dashboard
Open: http://localhost:4040

You can see:
- All HTTP requests/responses
- Headers and body
- Response codes and timing
- Replay requests for debugging

## Webhook Data Flow

```
Khalti Payment Complete
        ↓
Khalti sends callback to:
https://your-ngrok-url/api/khalti-webhook
        ↓
ngrok forwards to:
http://localhost:3001/api/khalti-webhook
        ↓
webhook-server.ts receives data
        ↓
Parse payment status
        ↓
Call Cloud Function: sendOrderInvoice
        ↓
Send emails (customer, seller, admin)
        ↓
Response: { success: true }
```

## Common Issues

### Issue: "Cannot reach ngrok URL"
**Solution:**
- Verify ngrok is running: `ngrok http 3001`
- Check webhook server is running on port 3001
- Verify URL is correct (no typos)

### Issue: "Webhook not being called"
**Solution:**
- Make sure SUCCESS_URL in PaymentPage uses ngrok URL
- Check Khalti configuration has correct callback
- Verify ngrok URL is public (check with curl)

### Issue: "Port 3001 already in use"
**Solution:**
```bash
# Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use different port
ngrok http 3002
npx ts-node webhook-server.ts --port 3002
```

## Temporary vs Permanent

### For Local Testing (Temporary):
1. Start webhook server + ngrok
2. Update SUCCESS_URL to ngrok URL
3. Test payment flow
4. Stop ngrok, revert SUCCESS_URL

### For Production (Permanent):
1. Deploy webhook to Firebase Cloud Functions
2. Use permanent Firebase URL as SUCCESS_URL
3. Keep nod mailer configuration for email sending

## Next Steps

1. ✅ ngrok installed
2. ✅ webhook-server.ts created
3. ⏭️ Start servers (follow steps above)
4. ⏭️ Test payment flow
5. ⏭️ Verify emails are sent
6. ⏭️ Review logs in ngrok dashboard

## Useful Commands

```bash
# View ngrok version
ngrok version

# Start ngrok with specific region (faster)
ngrok http 3001 --region us

# View all ngrok statusnogrok config

# Kill ngrok
# Ctrl+C in ngrok terminal

# Test webhook locally (without Khalti)
curl -X POST http://localhost:3001/api/khalti-webhook \
  -H "Content-Type: application/json" \
  -d '{"pidx":"123","status":"Completed","transaction_id":"abc"}'
```

## Documentation Files

- **NGROK_SETUP.md** - Detailed ngrok setup guide
- **EMAIL_SETUP.md** - Email configuration guide
- **webhook-server.ts** - Local webhook receiver code
- **Start-LocalTesting.ps1** - PowerShell quick start

---

**Ready to test? Start the servers and make a payment!** 🚀
