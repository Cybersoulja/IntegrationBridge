import { Router } from 'express';
import { db } from '@db';
import { serviceConnections, apiLogs } from '@db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Apply auth middleware to all routes
router.use(requireAuth);

router.get('/status', async (req, res) => {
  const userId = req.user?.id;

  try {
    const connections = await db.select().from(serviceConnections)
      .where(eq(serviceConnections.userId, userId!));

    const status = await Promise.all(connections.map(async (conn) => {
      const logs = await db.select().from(apiLogs)
        .where(eq(apiLogs.service, conn.service))
        .limit(10);

      const errors = logs.filter(log => log.statusCode >= 400).length;
      const health = errors === 0 ? 'healthy' : errors <= 3 ? 'degraded' : 'unhealthy';

      return {
        service: conn.service,
        health,
        lastCheck: conn.lastCheck,
        isActive: conn.isActive
      };
    }));

    res.json({ status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;