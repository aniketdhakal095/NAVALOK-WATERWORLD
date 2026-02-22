# Copy-Paste Commands for ngrok Testing

## Setup Commands (One-time)

### Install ngrok (if not already done)
```bash
npm install -g ngrok
```

### Install webhook dependencies
```bash
cd c:\fyp\NAVALOK-WATERWORLD-main
npm install express cors ts-node @types/express --save-dev
```

---

## Running Local Testing

### 🖥️ Terminal 1: Start Webhook Server
```bash
cd c:\fyp\NAVALOK-WATERWORLD-main
npx ts-node webhook-server.ts
```

**Expected Output:**
```
🚀 Server running on http://localhost:3001
```

---

### 🌐 Terminal 2: Start ngrok
```bash
ngrok http 3001
```

**✨ Copy the Forwarding URL** (looks like: `https://abc123def456.ngrok.io`)

---

### 📱 Terminal 3: Start Expo App
```bash
cd c:\fyp\NAVALOK-WATERWORLD-main
npm start
```

---

## Testing Commands

### Test 1: Check if webhook server is running
```bash
curl -X GET http://localhost:3001/api/test
```

### Test 2: Test through ngrok
```bash
curl -X GET https://YOUR_NGROK_URL/api/test
```

### Test 3: Simulate webhook callback
```bash
curl -X POST http://localhost:3001/api/khalti-webhook \
  -H "Content-Type: application/json" \
  -d "{\"pidx\":\"test123\",\"status\":\"Completed\",\"transaction_id\":\"trans123\"}"
```

### Test 4: Check ngrok web dashboard
```
http://localhost:4040
```

---

## Monitoring Commands

### View ngrok status
```bash
ngrok config check
```

### View webhook server logs (Terminal 1)
```
Just watch Terminal 1 output
```

### View payment emails sent (Firebase Console)
```
https://console.firebase.google.com -> Functions -> Logs
```

---

## Cleanup Commands

### Stop all servers
```bash
# Press Ctrl+C in each terminal
# Terminal 1: Webhook server stops
# Terminal 2: ngrok stops  
# Terminal 3: Expo stops
```

### Kill process on port 3001 (if stuck)
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## Full Testing Workflow (Copy-Paste All)

### 1. Terminal 1 - Start Webhook Server
```bash
cd c:\fyp\NAVALOK-WATERWORLD-main
npx ts-node webhook-server.ts
```

### 2. Terminal 2 - Start ngrok
```bash
ngrok http 3001
```
⏸️ **WAIT**: Copy the URL that appears!

### 3. Terminal 3 - Start Expo App
```bash
cd c:\fyp\NAVALOK-WATERWORLD-main
npm start
```

### 4. Update PaymentPage.tsx (Temporary)
Replace this line in `app/PaymentPage/index.tsx`:
```tsx
const SUCCESS_URL = 'https://example.com/khalti-success';
```

With:
```tsx
const SUCCESS_URL = 'https://YOUR_NGROK_URL/api/khalti-webhook';
```

### 5. Test Payment in App
- Open app on device
- Complete a test payment
- Watch Terminal 1 for webhook logs
- Check email inbox for invoice

### 6. Revert PaymentPage.tsx
```tsx
const SUCCESS_URL = 'https://example.com/khalti-success';
```

---

## Troubleshooting Commands

### Check if ngrok is installed
```bash
ngrok --version
```

### Check if port 3001 is in use
```bash
netstat -ano | findstr :3001 | findstr LISTENING
```

### Check Firebase Functions logs
```bash
firebase functions:log
```

### View all npm packages installed
```bash
npm list -g ngrok
npm list express cors ts-node
```

---

## Environment Variables (Optional)

Create `.env.local` file:
```
NGROK_URL=https://abc123def456.ngrok.io
WEBHOOK_URL=${NGROK_URL}/api/khalti-webhook
WEBHOOK_PORT=3001
```

---

## Video Tutorial Quick Steps

1. **Setup Phase** (1 min)
   ```bash
   npm install -g ngrok
   npm install express cors ts-node @types/express --save-dev
   ```

2. **Terminal 1** (30 sec)
   ```bash
   npx ts-node webhook-server.ts
   ```

3. **Terminal 2** (30 sec)
   ```bash
   ngrok http 3001
   ```
   📋 **Copy URL**

4. **Terminal 3** (30 sec)
   ```bash
   npm start
   ```

5. **App Testing** (2 min)
   - Update SUCCESS_URL
   - Complete payment
   - Watch logs
   - Check email

6. **Cleanup** (30 sec)
   - Revert SUCCESS_URL
   - Stop all servers
   - Done! ✓

**Total Time: ~5 minutes**

---

## Success Indicators

✅ Webhook server running on port 3001
✅ ngrok showing "Forwarding" to http://localhost:3001
✅ Expo app starting without errors
✅ ngrok web dashboard showing HTTP requests
✅ Terminal 1 logging webhook receives
✅ Email received in inbox (customer, seller, admin)

---

## Need Help?

- Check logs in each terminal
- Use ngrok web dashboard (http://localhost:4040)
- Review NGROK_SETUP.md for detailed info
- Check EMAIL_SETUP.md for mail configuration

**Everything is set up and ready to test locally!** 🎉
