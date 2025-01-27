import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '@db';
import { apiLogs } from '@db/schema';

const execAsync = promisify(exec);
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

// Allowed commands whitelist
const ALLOWED_COMMANDS = new Set([
  'ls', 'cat', 'echo', 'pwd', 'date',
  'grep', 'wc', 'head', 'tail', 'sort'
]);

router.post('/execute', async (req, res) => {
  const { command } = req.body;
  const userId = req.user?.id;

  // Validate command
  const baseCommand = command.split(' ')[0];
  if (!ALLOWED_COMMANDS.has(baseCommand)) {
    await db.insert(apiLogs).values({
      userId,
      service: 'shellfish',
      endpoint: '/execute',
      method: 'POST',
      statusCode: 400,
      error: 'Command not allowed'
    });

    return res.status(400).json({ error: 'Command not allowed' });
  }

  try {
    const { stdout, stderr } = await execAsync(command);

    await db.insert(apiLogs).values({
      userId,
      service: 'shellfish',
      endpoint: '/execute',
      method: 'POST',
      statusCode: 200
    });

    res.json({ stdout, stderr });
  } catch (error: any) {
    await db.insert(apiLogs).values({
      userId,
      service: 'shellfish',
      endpoint: '/execute',
      method: 'POST',
      statusCode: 500,
      error: error.message
    });

    res.status(500).json({ error: error.message });
  }
});

export default router;