import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { getRedis } from '../config/redis';
import authRoutes from './auth.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

router.get('/health', async (_req: Request, res: Response) => {
  const healthcheck = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.data.services.database = 'healthy';
  } catch {
    healthcheck.data.services.database = 'unhealthy';
  }

  try {
    const redis = getRedis();
    await redis.ping();
    healthcheck.data.services.redis = 'healthy';
  } catch {
    healthcheck.data.services.redis = 'unhealthy';
  }

  const allHealthy =
    healthcheck.data.services.database === 'healthy' &&
    healthcheck.data.services.redis === 'healthy';

  res.status(allHealthy ? 200 : 503).json(healthcheck);
});

export default router;
