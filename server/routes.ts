import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { rateLimit } from "./middleware/rate-limiter";
import workingCopyRouter from "./services/working-copy";
import shellfishRouter from "./services/shellfish";
import textasticRouter from "./services/textastic";
import monitorRouter from "./services/monitor";

export function registerRoutes(app: Express): Server {
  // Set up authentication
  setupAuth(app);

  // Apply rate limiting to all API routes
  app.use('/api', rateLimit());

  // Service routes
  app.use('/api/working-copy', workingCopyRouter);
  app.use('/api/shellfish', shellfishRouter);
  app.use('/api/textastic', textasticRouter);
  app.use('/api/monitor', monitorRouter);

  const httpServer = createServer(app);
  return httpServer;
}
