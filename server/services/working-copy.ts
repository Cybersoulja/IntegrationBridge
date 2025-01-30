import { Router } from 'express';
import { db } from '@db';
import { fileOperations } from '@db/schema';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const router = Router();

// Input validation schemas
const filePathSchema = z.object({
  filePath: z.string()
    .min(1, "File path is required")
    .refine(path => !path.includes('..'), "Invalid file path")
    .refine(path => /^[a-zA-Z0-9\-_/. ]+$/.test(path), "Invalid characters in file path")
});

const fileOperationSchema = filePathSchema.extend({
  content: z.string().optional()
});

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
  try {
    const { filePath } = filePathSchema.parse(req.body);
    const userId = req.user?.id;

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
    const userId = req.user?.id;
    const filePath = req.body?.filePath;

    if (userId && filePath) {
      await db.insert(fileOperations).values({
        userId,
        service: 'working-copy',
        operation: 'read',
        path: filePath,
        status: 'error'
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }

    res.status(500).json({ error: error.message });
  }
});

router.post('/write', async (req, res) => {
  try {
    const { filePath, content } = fileOperationSchema.parse(req.body);
    const userId = req.user?.id;

    const normalizedPath = path.normalize(filePath);
    await fs.writeFile(normalizedPath, content || '', 'utf-8');

    await db.insert(fileOperations).values({
      userId,
      service: 'working-copy',
      operation: 'write',
      path: filePath,
      status: 'success'
    });

    res.json({ success: true });
  } catch (error: any) {
    const userId = req.user?.id;
    const filePath = req.body?.filePath;

    if (userId && filePath) {
      await db.insert(fileOperations).values({
        userId,
        service: 'working-copy',
        operation: 'write',
        path: filePath,
        status: 'error'
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }

    res.status(500).json({ error: error.message });
  }
});

export default router;