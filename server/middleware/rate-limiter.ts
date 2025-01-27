import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimit = (
  windowMs: number = 60000, // 1 minute
  max: number = 100 // limit each IP to 100 requests per windowMs
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();

    if (!store[ip]) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (now > store[ip].resetTime) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (store[ip].count >= max) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.',
      });
    }

    store[ip].count++;
    next();
  };
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((ip) => {
    if (now > store[ip].resetTime) {
      delete store[ip];
    }
  });
}, 60000);
