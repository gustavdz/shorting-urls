import { describe, expect, it } from 'vitest';

import { createMockUrl } from '../../../test/fixtures/urlFixtures';
import {
  createMockRequest,
  createMockResponse,
} from '../../../test/mocks/expressMock';
import { createUrlServiceMock } from '../../../test/mocks/serviceMock';
import { createUrlController } from '../UrlController';

describe('UrlController', () => {
  const setupTest = () => {
    const mockService = createUrlServiceMock();
    const controller = createUrlController(mockService);
    return { mockService, controller };
  };

  describe('createShortUrl', () => {
    it('should create short URL successfully', async () => {
      const { mockService, controller } = setupTest();
      const mockReq = createMockRequest({
        body: { longUrl: 'https://example.com' },
      });
      const mockRes = createMockResponse();

      mockService.createShortUrl.mockResolvedValue({
        shortUrl: 'http://localhost:3000/abc123',
        longUrl: 'https://example.com',
        shortCode: 'abc123',
      });

      await controller.createShortUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        shortUrl: 'http://localhost:3000/abc123',
        longUrl: 'https://example.com',
        shortCode: 'abc123',
      });
    });

    it('should return 400 when longUrl is missing', async () => {
      const { controller } = setupTest();
      const mockReq = createMockRequest({ body: {} });
      const mockRes = createMockResponse();

      await controller.createShortUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'longUrl is required',
      });
    });

    it('should handle service errors', async () => {
      const { mockService, controller } = setupTest();
      const mockReq = createMockRequest({
        body: { longUrl: 'invalid-url' },
      });
      const mockRes = createMockResponse();

      mockService.createShortUrl.mockRejectedValue(
        new Error('Invalid URL provided')
      );

      await controller.createShortUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid URL provided',
      });
    });
  });

  describe('redirectToLongUrl', () => {
    it('should redirect to long URL', async () => {
      const { mockService, controller } = setupTest();
      const mockReq = createMockRequest({
        params: { shortCode: 'abc123' },
      });
      const mockRes = createMockResponse();

      mockService.getLongUrl.mockResolvedValue('https://example.com');

      await controller.redirectToLongUrl(mockReq, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith('https://example.com');
    });

    it('should return 404 when short URL not found', async () => {
      const { mockService, controller } = setupTest();
      const mockReq = createMockRequest({
        params: { shortCode: 'nonexistent' },
      });
      const mockRes = createMockResponse();

      mockService.getLongUrl.mockResolvedValue(null);

      await controller.redirectToLongUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Short URL not found',
      });
    });

    it('should return 400 when shortCode is missing', async () => {
      const { controller } = setupTest();
      const mockReq = createMockRequest({ params: {} });
      const mockRes = createMockResponse();

      await controller.redirectToLongUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'shortCode is required',
      });
    });
  });

  describe('getUrlStats', () => {
    it('should return URL statistics', async () => {
      const { mockService, controller } = setupTest();
      const mockReq = createMockRequest({
        params: { shortCode: 'abc123' },
      });
      const mockRes = createMockResponse();
      const mockUrl = createMockUrl();

      mockService.getUrlStats.mockResolvedValue(mockUrl);

      await controller.getUrlStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockUrl);
    });

    it('should return 404 when URL not found', async () => {
      const { mockService, controller } = setupTest();
      const mockReq = createMockRequest({
        params: { shortCode: 'nonexistent' },
      });
      const mockRes = createMockResponse();

      mockService.getUrlStats.mockResolvedValue(null);

      await controller.getUrlStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Short URL not found',
      });
    });
  });

  describe('getAllUrls', () => {
    it('should return all URLs', async () => {
      const { mockService, controller } = setupTest();
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const urls = [createMockUrl()];

      mockService.getAllUrls.mockResolvedValue(urls);

      await controller.getAllUrls(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(urls);
    });

    it('should handle service errors', async () => {
      const { mockService, controller } = setupTest();
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();

      mockService.getAllUrls.mockRejectedValue(new Error('Database error'));

      await controller.getAllUrls(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });
  });
});
