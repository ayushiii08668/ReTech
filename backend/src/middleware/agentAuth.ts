import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Agent, { IAgent } from '../models/Agent.js';
import AppError from '../utils/AppError.js';

export interface AgentRequest extends Request {
  agent?: IAgent;
}

export const authenticateAgent = async (
  req: AgentRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const agentId = (req.headers['x-agent-id'] as string) || (req.query.agentId as string);
    const agentKey =
      (req.headers['x-agent-key'] as string) ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : undefined);

    if (!agentId || !agentKey) {
      return next(
        new AppError('Agent authentication required. Missing x-agent-id or x-agent-key header.', 401),
      );
    }

    const agent = await Agent.findOne({ agentId }).select('+apiKeyHash');
    if (!agent) {
      return next(new AppError('Unregistered or unknown sanitization agent.', 401));
    }

    if (agent.status === 'REVOKED') {
      return next(new AppError('Agent access has been revoked by platform administrator.', 403));
    }

    if (!agent.apiKeyHash) {
      return next(new AppError('Agent has not been paired or credentials are invalid.', 401));
    }

    const hash = crypto.createHash('sha256').update(agentKey).digest('hex');
    if (hash !== agent.apiKeyHash) {
      return next(new AppError('Invalid agent authentication credentials.', 401));
    }

    // Agent authenticated successfully; update active heartbeat
    agent.lastSeenAt = new Date();
    if (agent.status === 'OFFLINE' || agent.status === 'PAIRING_PENDING') {
      agent.status = 'ONLINE';
    }
    await agent.save();

    req.agent = agent;
    next();
  } catch (error) {
    next(error);
  }
};

