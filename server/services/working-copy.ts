import { Router } from 'express';
import { db } from '@db';
import { fileOperations } from '@db/schema';
import fs from 'fs/promises';
import path from 'path';

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

// File operations endpoints
router.post('/read', async (req, res) => {
  const { filePath } = req.body;
  const userId = req.user?.id;

  try {
    const normalizedPath = path.normalize(filePath);
    const content = await fs.readFile(normalizedPath, 'utf-8');

    await db.insert(fileOperations).values({
      userId,
      service: 'working-copy',
      operation: 'read',
      path: filePath,
      status: 'success'
    });

    res.json({ content });
  } catch (error: any) {
    await db.insert(fileOperations).values({
      userId,
      service: 'working-copy',
      operation: 'read',
      path: filePath,
      status: 'error'
    });

    res.status(500).json({ error: error.message });
  }
});

router.post('/write', async (req, res) => {
  const { filePath, content } = req.body;
  const userId = req.user?.id;

  try {
    const normalizedPath = path.normalize(filePath);
    await fs.writeFile(normalizedPath, content, 'utf-8');

    await db.insert(fileOperations).values({
      userId,
      service: 'working-copy',
      operation: 'write',
      path: filePath,
      status: 'success'
    });

    res.json({ success: true });
  } catch (error: any) {
    await db.insert(fileOperations).values({
      userId,
      service: 'working-copy',
      operation: 'write',
      path: filePath,
      status: 'error'
    });

    res.status(500).json({ error: error.message });
  }
});

export default router;