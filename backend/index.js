require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const connectDB = require('./config/db');
const logger = require('./config/logger');
const errorMiddleware = require('./middlewares/errorMiddleware');
const AppError = require('./utils/AppError');

// Routes imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const paperRoutes = require('./routes/paperRoutes');
const noteRoutes = require('./routes/noteRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize app
const app = express();

// Set security HTTP headers (configured to allow cross-origin local iframe embeds)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: false,
  })
);

// Configure CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cookie parser for secure HttpOnly session tokens
app.use(cookieParser());

// Stream HTTP request logs into Winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// Global Rate Limiting - protect against brute force / denial attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: 'Too many requests from this IP. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Catch-all for undefined route paths
app.use((req, res, next) => {
  next(new AppError(`Cannot find endpoint "${req.originalUrl}" on this server.`, 404));
});

// Centralized error responder middleware
app.use(errorMiddleware);

// Initialize DB and listen
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Research Nexus Backend running in [${process.env.NODE_ENV || 'development'}] mode on port: ${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error(`Critical Server Startup Failure: ${err.message}`);
  process.exit(1);
});
