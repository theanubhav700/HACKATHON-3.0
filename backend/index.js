const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or any localhost port
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Fake Money Virtual Payment Simulator',
    disclaimer: 'This application is strictly for simulation/demo purposes. No real money or banking systems are connected.',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/feedback', require('./routes/feedback'));

// Fallback alias in case client prepends /api twice
app.use('/api/api/auth', require('./routes/auth'));
app.use('/api/api/user', require('./routes/user'));
app.use('/api/api/payments', require('./routes/payments'));
app.use('/api/api/transactions', require('./routes/transactions'));
app.use('/api/api/feedback', require('./routes/feedback'));

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Fake Money Simulator Backend running on http://localhost:${PORT}`);
});
