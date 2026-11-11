import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

import env from './config/env.js';
import routes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

/**
 * Create and configure the Express application.
 */
const app = express();

// --------------- Security Middleware ---------------

// Set security HTTP headers
app.use(helmet());

// Enable CORS with dynamic multi-origin reflection (supports Vercel, localhost, and custom domains)
app.use(
  cors({
    origin: (origin, callback) => {
      // Reflect requesting origin to satisfy browser credentials policy
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-agent-id', 'x-agent-key'],
  }),
);

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiting – General operational API limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use(limiter);

// Strict rate limiting on authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many login/registration attempts from this IP, please try again after 15 minutes.',
  },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/auth/login', authLimiter);

// --------------- Body Parsing ---------------

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --------------- Logging ---------------

const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// --------------- Routes ---------------

// Root welcome handler for web browsers
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'ReTech Platform API',
    status: 'online',
    version: '1.0.0',
    documentation: 'https://github.com/ayushiii08668/ReTech',
    healthCheck: '/health',
  });
});

// Root health probe for load balancers & container orchestrators
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api', routes);
app.use('/api/v1', routes);

// --------------- Error Handling ---------------

// Handle undefined routes
app.use(notFound);

// Central error handler (must be last)
app.use(errorHandler);

export default app;
