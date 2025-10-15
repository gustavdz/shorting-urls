import dotenv from 'dotenv';
import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';
import { createApp } from '@shorting-urls/presentation/app';
import { createContainer } from '@shorting-urls/infrastructure/container';

dotenv.config();

const PORT = process.env.PORT ?? 3000;

const setupGracefulShutdown = (prisma: PrismaClient) => {
  const shutdown = async (signal: string) => {
    console.warn(`${signal} received, shutting down gracefully`);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

const startServer = (app: Express, port: number | string) => {
  app.listen(port, () => {
    console.warn(`🚀 Server running on port ${port}`);
    console.warn(`📊 Health check: http://localhost:${port}/health`);
  });
};

const bootstrap = () => {
  try {
    const container = createContainer();
    const app = createApp(container.urlController);

    setupGracefulShutdown(container.prisma);
    startServer(app, PORT);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();
