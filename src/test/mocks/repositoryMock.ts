import { vi } from 'vitest';

import { UrlRepository } from '@shorting-urls/domain/repositories/UrlRepository';

export const createUrlRepositoryMock = () =>
  ({
    create: vi.fn(),
    findByShortCode: vi.fn(),
    incrementClicks: vi.fn(),
    findAll: vi.fn(),
  }) satisfies UrlRepository;
