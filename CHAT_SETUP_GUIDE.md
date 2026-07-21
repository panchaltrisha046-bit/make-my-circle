# Circle Chat - Setup & Debugging Guide

## Overview
This guide covers setting up the complete Chat system for Make My Circle, including user-to-user chat and AI Assistant chat.

---

## ✅ Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally (`mongodb://127.0.0.1:27017/makemycircle`)
- OpenAI API key OR Gemini API key (for AI Chat)

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Install Client Dependencies
```bash
cd client
npm install
```

### 3. Configure Environment Variables

#### Server Setup (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/makemycircle
JWT_SECRET=makemycircle_jwt_secret_key_please_change_in_production_to_something_random_and_secure

# Option 1: Use OpenAI (Recommended)
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_OPENAI_KEY_HERE
OPENAI_MODEL=gpt-4o-mini

# OR Option 2: Use Gemini
# GEMINI_API_KEY=AIza-YOUR_ACTUAL_GEMINI_KEY_HERE
# GEMINI_MODEL=gemini-1.5-pro
```

#### Client Setup (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

### 4. Start the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

The app should now be running at `http://localhost:5173`

---

## 🔧 Files Modified & Why

### Backend Changes

#### 1. **`server/server.js`** - Server Configuration
**Changes Made:**
- Added JWT_SECRET validation with helpful warnings
- Improved CORS configuration (was too permissive with `'*'`)
- Added Socket.io disconnect logging
- Better environment validation for AI providers
- Added helpful startup messages showing configuration status

**Why:** Ensures proper configuration is validated at startup and provides visibility into server health.

#### 2. **`server/.env`** - Environment Configuration
**Changes Made:**
- Added JWT_SECRET configuration (was missing)
- Updated OPENAI_API_KEY from placeholder to empty (requires user to add key)
- Added detailed comments explaining setup process
- Added fallback for CLIENT_URL configuration

**Why:** Users must explicitly add their API keys to prevent "Network Error" failures.

#### 3. **`server/services/aiService.js`** - AI Integration Service
**Changes Made:**
- Added comprehensive validation function `validateAIConfiguration()`
- Improved error messages with specific API key format validation
- Better error handling for 401, 429, 503 status codes
- Enhanced logging with `[AI Service]` prefix for easier debugging
- Added checks for empty/invalid API keys
- Improved Gemini API integration with updated endpoint format

**Why:** Better error messages help users understand what's wrong instead of generic "Network Error".

#### 4. **`server/controllers/aiChatController.js`** - AI Chat Logic
**Changes Made:**
- Added detailed logging for every operation
- Improved streaming response handling with better error states
- Fixed edge case where messages weren't being saved on AI errors
- Added Access-Control-Allow-Origin header for CORS
- Better event stream error handling to prevent stream corruption
- Added `[AI Chat]` prefix to all console logs

**Why:** Ensures messages are properly persisted even if AI generation fails, and prevents hanging requests.

#### 5. **`server/controllers/messageController.js`** - User-to-User Chat
**Changes Made:**
- Moved Socket.io emission to AFTER successful message save
- Added message timestamp to Socket.io events
- Added sender name to Socket.io events for better UI display
- Added logging for message sending

**Why:** Ensures real-time messages only show up after they're saved to database, preventing data loss.

### Frontend Changes

#### 1. **`client/.env`** - Client Configuration
**Changes Made:**
- Added detailed comments about API URL configuration
- Added note about production setup

**Why:** Makes it clear how to configure the backend connection.

#### 2. **`client/src/pages/Chat.jsx`** - Main Chat Component
**Changes Made:**
- Fixed AI message streaming to properly append assistant message only once
- Improved error handling with clearer error messages
- Fixed optimistic message removal (was adding unnecessary dummy message)
- Better state management for streaming content
- Improved message rendering to properly display streamed content
- Fixed error display to show ❌ emoji for clarity
- Better handling of empty assistant messages

**Why:** Messages now display correctly as they stream, and errors are more helpful.

---

## 🐛 Common Issues & Solutions

### Issue 1: "AI Chat is not configured" Error
**Cause:** Missing API key in `server/.env`

**Solution:**
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys) or [Gemini](https://makersuite.google.com/app/apikey)
2. Add to `server/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-...YOUR_KEY_HERE...
   ```
3. Restart the server

### Issue 2: "Network Error" or "Failed to fetch"
**Cause:** Server not running or API key invalid

**Solution:**
1. Check server is running: `http://localhost:5000` in browser should show "Cannot GET /"
2. Check `.env` file has correct API key format
3. Check server logs for specific error messages
4. Run: `npm run dev` in server folder

### Issue 3: Messages stay on "Sending..."
**Cause:** Socket.io connection not established

**Solution:**
1. Check browser console for errors (F12 → Console tab)
2. Verify server Socket.io is running
3. Check that `VITE_API_URL=http://localhost:5000` in client/.env
4. Try hard refresh (Ctrl+Shift+R)

### Issue 4: User-to-user messages not appearing
**Cause:** Mutual follow relationship not established

**Solution:**
1. Both users must follow each other for chat to work
2. Go to each user's profile and click "Follow"
3. When both have followed each other, they appear in chat list

### Issue 5: AI responses very slow or timeout
**Cause:** OpenAI API rate limiting or network issues

**Solution:**
1. Wait a few minutes and try again
2. Check OpenAI account usage at https://platform.openai.com/account/usage
3. If rate limited, switch to Gemini (usually has higher free tier)

---

## 🔍 Debugging Tips

### Enable Detailed Server Logging
Add this to `server/server.js` after middleware setup:
```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

### Check Frontend Errors
1. Open Browser DevTools (F12)
2. Go to "Console" tab
3. Look for red errors starting with `[Frontend AI]` or `[Socket.io]`

### Monitor Network Requests
1. Open Browser DevTools (F12)
2. Go to "Network" tab
3. Perform an action (send AI message, etc.)
4. Look for failed requests or high latency

### Test AI Service Directly
Create `server/test-ai.js`:
```javascript
require('dotenv').config();
const { streamAssistantReply } = require('./services/aiService');

(async () => {
  try {
    console.log('Testing AI service...');
    const result = await streamAssistantReply([], 'Hello', (chunk) => {
      process.stdout.write(chunk);
    });
    console.log('\n✓ AI Service working!');
  } catch (err) {
    console.error('✗ AI Service error:', err.message);
  }
})();
```

Run: `node test-ai.js`

---

## 📊 Architecture Overview

```
Make My Circle - Chat System
├── User-to-User Chat
│   ├── Frontend: Chat.jsx (messages, conversations UI)
│   ├── Backend: messageController.js (send, retrieve)
│   ├── Database: Message model
│   └── Real-time: Socket.io
│
└── AI Chat
    ├── Frontend: Chat.jsx (AI conversation UI)
    ├── Backend: aiChatController.js (send, stream)
    ├── AI Service: aiService.js (OpenAI/Gemini)
    ├── Database: AIChat model
    └── Real-time: Server-Sent Events (SSE)
```

---

## 📝 Testing Checklist

### User-to-User Chat
- [ ] Create two test accounts
- [ ] Make them follow each other
- [ ] Send a message from Account A → Account B
- [ ] Message appears immediately on Account A
- [ ] Message appears on Account B in real-time
- [ ] Can reply from Account B → Account A
- [ ] Both see complete conversation history

### AI Chat
- [ ] OpenAI API key is set in `.env`
- [ ] Click "Circle AI" in chat sidebar
- [ ] Type a question like "Explain React Hooks"
- [ ] See AI response streaming in real-time
- [ ] Response appears without "Sending..." state
- [ ] Can send multiple messages in same conversation
- [ ] Chat history persists after refresh

### Error Handling
- [ ] Remove API key from `.env` and try sending AI message
- [ ] See helpful error message (not "Network Error")
- [ ] Disconnect MongoDB and try sending message
- [ ] See database connection error
- [ ] Stop server and try sending message
- [ ] See connection refused error

---

## 🚀 Production Deployment

Before deploying:
1. Change `JWT_SECRET` to a strong random string
2. Set `OPENAI_API_KEY` or `GEMINI_API_KEY`
3. Update `MONGO_URI` to production database
4. Update `CLIENT_URL` to production frontend URL
5. Build client: `npm run build`
6. Deploy both to production server

---

## 📞 Need Help?

Check logs for `[AI Service]`, `[AI Chat]`, `[Frontend AI]`, or `[Socket.io]` prefixes for specific debugging info.

All components are properly logging errors with descriptive messages.
