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

router.post('/edit', async (req, res) => {
  const { filePath, content } = req.body;
  const userId = req.user?.id;

  try {
    const normalizedPath = path.normalize(filePath);
    await fs.writeFile(normalizedPath, content, 'utf-8');

    await db.insert(fileOperations).values({
      userId,
      service: 'textastic',
      operation: 'edit',
      path: filePath,
      status: 'success'
    });

    res.json({ success: true });
  } catch (error: any) {
    await db.insert(fileOperations).values({
      userId,
      service: 'textastic',
      operation: 'edit',
      path: filePath,
      status: 'error'
    });

    res.status(500).json({ error: error.message });
  }
});

router.get('/syntax', async (req, res) => {
  const { filePath } = req.query;
  const userId = req.user?.id;

  try {
    const ext = path.extname(filePath as string);
    const syntaxMap: { [key: string]: string } = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json'
    };

    res.json({ syntax: syntaxMap[ext] || 'plaintext' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;