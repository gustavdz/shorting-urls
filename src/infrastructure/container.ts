import { getPrismaClient } from '@shorting-urls/infrastructure/database/prisma';
import { createPrismaUrlRepository } from '@shorting-urls/infrastructure/repositories/PrismaUrlRepository';
import { createUrlService } from '@shorting-urls/application/services/UrlServiceImpl';
import { createUrlController } from '@shorting-urls/presentation/controllers/UrlController';

export const createContainer = () => {
  const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

  const prisma = getPrismaClient();
  const urlRepository = createPrismaUrlRepository(prisma);
  const urlService = createUrlService(urlRepository, baseUrl);
  const urlController = createUrlController(urlService);

  return {
    urlController,
    prisma,
  };
};
