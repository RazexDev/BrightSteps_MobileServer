require('dotenv').config();
const dns = require('dns'); // 👈 NEW: Import Node's built-in DNS module

// 👈 NEW: Force Node to use Google's DNS to fix Atlas SRV resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Global Error Handlers for Stability
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err);
  // Give the server a few ms to log before exiting
  setTimeout(() => process.exit(1), 100);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION:', reason);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const chatRoutes = require('./routes/chat');
const alertRoutes = require('./routes/alerts');
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progressRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
  const logMsg = `Request: ${req.method} ${req.url} | Body: ${JSON.stringify(req.body)} | Role: ${req.user?.role || 'unknown'}`;
  console.log(logMsg);
  next();
});

// Root Route for Viva APK Download
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Download BrightSteps</title>
        <style>
            body {
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #0f172a;
                color: #f8fafc;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                background-color: #1e293b;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                max-width: 400px;
                width: 90%;
            }
            .logo { font-size: 50px; margin-bottom: 20px; }
            h1 { margin: 0 0 10px; font-size: 24px; font-weight: 600; }
            p { color: #94a3b8; margin-bottom: 30px; line-height: 1.5; font-size: 15px;}
            .btn {
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                text-decoration: none;
                padding: 14px 28px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                transition: background 0.2s;
            }
            .btn:hover { background-color: #2563eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🚀</div>
            <h1>BrightSteps App</h1>
            <p>Welcome! Click the button below to view and install the latest Android APK for evaluation.</p>
            <a href="https://expo.dev/accounts/razexdev/projects/brightsteps/builds/767098c3-74df-480f-b0c1-dfed25a4e692" class="btn" target="_blank">Download APK (Expo)</a>
        </div>
    </body>
    </html>
  `);
});

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend is reachable!' });
});

// Serve uploaded files (profile pictures etc.) as static assets
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base routes
app.use('/api/chat', chatRoutes);
app.use('/api/alerts', alertRoutes);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  family: 4,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud!'))
  .catch((err) => console.error('❌ Database connection error:', err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/routines', require('./routes/routines'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/extra-tasks', require('./routes/extraTasks'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/flags', require('./routes/chatRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/skills', require('./routes/skillAreaRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (Interface: 0.0.0.0)`);
});