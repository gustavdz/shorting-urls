import { describe, expect, it } from 'vitest';

import { createMockUrl } from '../../../test/fixtures/urlFixtures';
import { createPrismaClientMock } from '../../../test/mocks/prismaMock';
import { createPrismaUrlRepository } from '../PrismaUrlRepository';

describe('PrismaUrlRepository', () => {
  const setupTest = () => {
    const prismaMock = createPrismaClientMock();
    const repository = createPrismaUrlRepository(prismaMock);
    return { prismaMock, repository };
  };

  describe('create', () => {
    it('should create a new URL', async () => {
      const { prismaMock, repository } = setupTest();
      const mockUrl = createMockUrl();
      prismaMock.url.create.mockResolvedValue(mockUrl);

      const result = await repository.create('https://example.com', 'abc123');

      expect(result).toEqual(mockUrl);
      expect(prismaMock.url.create).toHaveBeenCalledWith({
        data: {
          longUrl: 'https://example.com',
          shortCode: 'abc123',
        },
      });
    });
  });

  describe('findByShortCode', () => {
    it('should find URL by short code', async () => {
      const { prismaMock, repository } = setupTest();
      const mockUrl = createMockUrl();
      prismaMock.url.findUnique.mockResolvedValue(mockUrl);

      const result = await repository.findByShortCode('abc123');

      expect(result).toEqual(mockUrl);
      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: { shortCode: 'abc123' },
      });
    });

    it('should return null when URL not found', async () => {
      const { prismaMock, repository } = setupTest();
      prismaMock.url.findUnique.mockResolvedValue(null);

      const result = await repository.findByShortCode('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('incrementClicks', () => {
    it('should increment clicks for URL', async () => {
      const { prismaMock, repository } = setupTest();

      await repository.incrementClicks('abc123');

      expect(prismaMock.url.update).toHaveBeenCalledWith({
        where: { shortCode: 'abc123' },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all URLs ordered by creation date', async () => {
      const { prismaMock, repository } = setupTest();
      const urls = [createMockUrl()];
      prismaMock.url.findMany.mockResolvedValue(urls);

      const result = await repository.findAll();

      expect(result).toEqual(urls);
      expect(prismaMock.url.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
