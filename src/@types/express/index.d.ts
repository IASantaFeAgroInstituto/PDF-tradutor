import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: number; // ou string, dependendo do que você está usando no JWT
    }
  }
}
