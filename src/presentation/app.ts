import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createUrlRoutes } from '@shorting-urls/presentation/routes/urlRoutes';
import type { UrlControllerType } from '@shorting-urls/presentation/types/ControllerTypes';

export const createApp = (urlController: UrlControllerType) => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use(createUrlRoutes(urlController));

  // 404 handler
  app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
};
