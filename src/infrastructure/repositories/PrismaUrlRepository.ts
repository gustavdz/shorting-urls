import type { PrismaClient } from '@prisma/client';
import type { UrlRepository } from '@shorting-urls/domain/repositories/UrlRepository';
import type { Url } from '@shorting-urls/domain/entities/Url';

export const createPrismaUrlRepository = (
  prisma: PrismaClient
): UrlRepository => {
  const create = async (longUrl: string, shortCode: string): Promise<Url> => {
    return prisma.url.create({
      data: {
        longUrl,
        shortCode,
      },
    });
  };

  const findByShortCode = async (shortCode: string): Promise<Url | null> => {
    return prisma.url.findUnique({
      where: { shortCode },
    });
  };

  const incrementClicks = async (shortCode: string): Promise<void> => {
    await prisma.url.update({
      where: { shortCode },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  };

  const findAll = async (): Promise<Url[]> => {
    return prisma.url.findMany({
      orderBy: { createdAt: 'desc' },
    });
  };

  return {
    create,
    findByShortCode,
    incrementClicks,
    findAll,
  };
};
