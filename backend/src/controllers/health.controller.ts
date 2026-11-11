import { Request, Response } from 'express';
import mongoose from 'mongoose';
import env from '../config/env.js';

/**
 * Map mongoose connection readyState to a human-readable string.
 */
const dbStateMap: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Health check controller.
 * Returns server status, uptime, environment, and database connection state.
 */
export const getHealth = (_req: Request, res: Response): void => {
  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      database: dbStateMap[dbState] ?? 'unknown',
    },
  });
};
