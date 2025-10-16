import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockUrl } from '../../../test/fixtures/urlFixtures';
import { createUrlRepositoryMock } from '../../../test/mocks/repositoryMock';
import { createUrlService } from '../UrlServiceImpl';

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'abc123'),
}));

describe('UrlService', () => {
  const setupTest = () => {
    const mockRepository = createUrlRepositoryMock();
    const urlService = createUrlService(
      mockRepository,
      'http://localhost:3000'
    );
    return { mockRepository, urlService };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createShortUrl', () => {
    it('should create short URL with valid input', async () => {
      const { mockRepository, urlService } = setupTest();
      const mockUrl = createMockUrl({ shortCode: 'abc123' });
      mockRepository.findByShortCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockUrl);

      const result = await urlService.createShortUrl({
        longUrl: 'https://example.com',
      });

      expect(result).toEqual({
        shortUrl: 'http://localhost:3000/abc123',
        longUrl: mockUrl.longUrl,
        shortCode: 'abc123',
      });
      expect(mockRepository.create).toHaveBeenCalledWith(
        'https://example.com',
        'abc123'
      );
    });

    it('should create short URL with custom code', async () => {
      const { mockRepository, urlService } = setupTest();
      const mockUrl = createMockUrl({ shortCode: 'custom' });
      mockRepository.findByShortCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockUrl);

      const result = await urlService.createShortUrl({
        longUrl: 'https://example.com',
        customCode: 'custom',
      });

      expect(result.shortCode).toBe('custom');
      expect(mockRepository.findByShortCode).toHaveBeenCalledWith('custom');
    });

    it('should throw error for invalid URL', async () => {
      const { urlService } = setupTest();

      await expect(
        urlService.createShortUrl({ longUrl: 'invalid-url' })
      ).rejects.toThrow('Invalid URL provided');
    });

    it('should throw error for existing custom code', async () => {
      const { mockRepository, urlService } = setupTest();
      const mockUrl = createMockUrl();
      mockRepository.findByShortCode.mockResolvedValue(mockUrl);

      await expect(
        urlService.createShortUrl({
          longUrl: 'https://example.com',
          customCode: 'existing',
        })
      ).rejects.toThrow('Custom code already exists');
    });

    it('should retry when generated code already exists', async () => {
      const { mockRepository, urlService } = setupTest();
      const mockUrl = createMockUrl({ shortCode: 'abc123' });
      mockRepository.findByShortCode
        .mockResolvedValueOnce(createMockUrl()) // First call returns existing
        .mockResolvedValueOnce(null); // Second call returns null
      mockRepository.create.mockResolvedValue(mockUrl);

      const result = await urlService.createShortUrl({
        longUrl: 'https://example.com',
      });

      expect(result.shortCode).toBe('abc123');
      expect(mockRepository.findByShortCode).toHaveBeenCalledTimes(2);
    });
  });

  describe('getLongUrl', () => {
    it('should return long URL and increment clicks', async () => {
      const { mockRepository, urlService } = setupTest();
      const mockUrl = createMockUrl();
      mockRepository.findByShortCode.mockResolvedValue(mockUrl);

      const result = await urlService.getLongUrl('abc123');

      expect(result).toBe(mockUrl.longUrl);
      expect(mockRepository.incrementClicks).toHaveBeenCalledWith('abc123');
    });

    it('should return null for non-existent short code', async () => {
      const { mockRepository, urlService } = setupTest();
      mockRepository.findByShortCode.mockResolvedValue(null);

      const result = await urlService.getLongUrl('nonexistent');

      expect(result).toBeNull();
      expect(mockRepository.incrementClicks).not.toHaveBeenCalled();
    });
  });

  describe('getUrlStats', () => {
    it('should return URL stats', async () => {
      const { mockRepository, urlService } = setupTest();
      const mockUrl = createMockUrl();
      mockRepository.findByShortCode.mockResolvedValue(mockUrl);

      const result = await urlService.getUrlStats('abc123');

      expect(result).toEqual(mockUrl);
    });

    it('should return null for non-existent URL', async () => {
      const { mockRepository, urlService } = setupTest();
      mockRepository.findByShortCode.mockResolvedValue(null);

      const result = await urlService.getUrlStats('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllUrls', () => {
    it('should return all URLs', async () => {
      const { mockRepository, urlService } = setupTest();
      const urls = [createMockUrl()];
      mockRepository.findAll.mockResolvedValue(urls);

      const result = await urlService.getAllUrls();

      expect(result).toEqual(urls);
    });
  });
});
