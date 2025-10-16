import { vi } from 'vitest';

import { UrlService } from '@shorting-urls/domain/services/UrlService';

export const createUrlServiceMock = () =>
  ({
    createShortUrl: vi.fn(),
    getLongUrl: vi.fn(),
    getUrlStats: vi.fn(),
    getAllUrls: vi.fn(),
  }) satisfies UrlService;
