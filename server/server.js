const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Validate required environment variables at startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'makemycircle_jwt_secret_key_please_change_in_production_to_something_random_and_secure') {
  console.warn('⚠️  WARNING: JWT_SECRET not properly configured. Set JWT_SECRET in server/.env for production use.');
}

if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: No AI provider configured. Set OPENAI_API_KEY or GEMINI_API_KEY in server/.env to enable AI Chat features.');
} else if (process.env.OPENAI_API_KEY) {
  console.log('✓ AI provider configured: OpenAI');
} else if (process.env.GEMINI_API_KEY) {
  console.log('✓ AI provider configured: Gemini');
}

const userRoutes = require('./routes/userroutes');
const requestRoutes = require('./routes/requestroutes');
const messageRoutes = require('./routes/messageroutes');
const notificationRoutes = require('./routes/notificationroutes');
const aiChatRoutes = require('./routes/aiChatRoutes');

const app = express();
const server = http.createServer(app);
// Dynamic CORS origin verification to support local port shifting (e.g. 5173 -> 5174)
const getCorsOrigin = (origin, callback) => {
  const clientUrl = process.env.CLIENT_URL;
  if (!origin) return callback(null, true);
  
  const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
  if (isLocalhost || (clientUrl && origin === clientUrl) || origin === 'http://localhost:5173' || origin === 'http://localhost:5174') {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      getCorsOrigin(origin, (err, allowed) => {
        if (err) return callback(null, false);
        return callback(null, origin);
      });
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.locals.io = io;

// CORS configuration - dynamic origin support
const corsOptions = {
  origin: getCorsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai-chat', aiChatRoutes);

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ userId }) => {
    if (userId) {
      socket.join(String(userId));
      console.log(`[Socket.io] User ${userId} joined room`);
    }
  });

  socket.on('sendMessage', ({ senderId, receiverId, content }) => {
    if (senderId && receiverId && content) {
      io.to(String(receiverId)).emit('receiveMessage', { senderId, content });
      console.log(`[Socket.io] Message sent from ${senderId} to ${receiverId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] User disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/makemycircle';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB database successfully.');
    server.listen(PORT, () => {
      console.log(`✓ Server is running on port: ${PORT}`);
      console.log(`✓ API URL: http://localhost:${PORT}`);
      console.log(`✓ Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  })
  .catch((err) => {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  });